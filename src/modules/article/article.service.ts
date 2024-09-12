import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { FollowEntity } from '../profile/follow.entity';

@Injectable()
export class ArticleService {
    constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity) private readonly followsRepository: Repository<FollowEntity>,
        private dataSource: DataSource) { }

    buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
        return { article };
    }

    private getSlug(title: string): string {
        return slugify(title, { lower: true }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    }

    async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
        const queryBuilder = this.dataSource.getRepository(ArticleEntity).createQueryBuilder(
            'articles',
        ).leftJoinAndSelect('articles.author', 'author');

        if (query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {
                tag: `%${query.tag}%`
            })
        }

        if (query.author) {
            const author = await this.usersRepository.findOne({ where: { username: query.author } });
            queryBuilder.andWhere('articles.authorId = :id', {
                id: author.id
            })
        }

        if (query.favorited) {
            const author = await this.usersRepository.findOne({ where: { username: query.favorited }, relations: ['favorites'] });
            const ids = author.favorites.map(el => el.id);
            if (ids.length > 0) {
                queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
            } else {
                queryBuilder.andWhere('1=0');
            }
        }

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if (query.limit) {
            queryBuilder.limit(query.limit);
        }
        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        let favoriteIds: number[] = [];
        if (currentUserId) {
            const currentUser = await this.usersRepository.findOne({ where: { id: currentUserId }, relations: ['favorites'] });
            favoriteIds = currentUser.favorites.map(favorite => favorite.id);
        }
        const articles = await queryBuilder.getMany();

        const articlesWithFavorited = articles.map(el => {
            const favorited = favoriteIds.includes(el.id);
            return { ...el, favorited };
        })
        return { articles: articlesWithFavorited, articlesCount };
    }

    async getFeed(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
        const follows = await this.followsRepository.find({ where: { followerId: currentUserId } });

        if (follows.length === 0) {
            return { articles: [], articlesCount: 0 };
        }

        const followingsUserIds = follows.map(el => el.followingId);

        const queryBuilder = this.dataSource.getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author')
            .where('articles.authorId IN (:...ids)', { ids: followingsUserIds });

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();
        if (query.limit) {
            queryBuilder.limit(query.limit);
        }

        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        const articles = await queryBuilder.getMany();

        return {
            articles,
            articlesCount
        }
    }

    async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        const newArticle = new ArticleEntity();
        Object.assign(newArticle, createArticleDto);
        if (!newArticle.tagList) {
            newArticle.tagList = [];
        }
        newArticle.slug = this.getSlug(createArticleDto.title);
        newArticle.author = currentUser;
        return await this.articleRepository.save(newArticle);
    }

    async findArticleBySlug(slug: string): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({ where: { slug } })
        return article;
    }

    async updateArticle(currentUserId: number, slug: string, updateArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        const article = await this.findArticleBySlug(slug);
        if (!article) {
            throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
        }

        Object.assign(article, updateArticleDto);
        return await this.articleRepository.save(article);
    }

    async deleteArticle(currentUserId: number, slug: string): Promise<DeleteResult> {
        const article = await this.findArticleBySlug(slug);
        if (!article) {
            throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
        }

        return await this.articleRepository.delete({ slug })
    }

    async likeArticle(currentUserId: number, slug: string): Promise<ArticleEntity> {
        const article = await this.findArticleBySlug(slug);
        const user = await this.usersRepository.findOne({ where: { id: currentUserId }, relations: ['favorites'] });
        const isNotFavorited = user.favorites.findIndex(articleInFavorites => articleInFavorites.id === article.id) === -1;

        if (isNotFavorited) {
            user.favorites.push(article);
            article.favoritesCount += 1;
            await this.usersRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }

    async dislikeArticle(currentUserId: number, slug: string): Promise<ArticleEntity> {
        const article = await this.findArticleBySlug(slug);
        const user = await this.usersRepository.findOne({ where: { id: currentUserId }, relations: ['favorites'] });
        const articleIndex = user.favorites.findIndex(articleInFavorites => articleInFavorites.id === article.id);

        if (articleIndex >= 0) {
            user.favorites.splice(articleIndex, 1);
            article.favoritesCount -= 1;
            await this.usersRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }
}
