import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { AuthGuard } from '../user/guards/auth.guard';
import { User } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { BackendValidationPipe } from 'src/common/pipes/backend-validation/backend-validation.pipe';

@Controller('articles')
export class ArticleController {

    constructor(private readonly articleService: ArticleService) { }

    @Get()
    async findAll(@User('id') currentUserId: number, @Query() query: any): Promise<ArticlesResponseInterface> {
        return await this.articleService.findAll(currentUserId, query);
    }

    @Get('feed')
    @UseGuards(AuthGuard)
    async getFeed(@User('id') currentUserId: number, @Query() query: any): Promise<ArticlesResponseInterface> { 
        return await this.articleService.getFeed(currentUserId, query);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async createArticle(@User() currentUser: UserEntity, @Body('article') createArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
        const article = await this.articleService.createArticle(currentUser, createArticleDto);
        return this.articleService.buildArticleResponse(article);
    }

    @Get(':slug')
    async findArticleBySlug(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articleService.findArticleBySlug(slug);
        return this.articleService.buildArticleResponse(article);

    }

    @Put(':slug')
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async updateArticle(@User('id') currentUserId: number, @Param('slug') slug: string, @Body('article') updateArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
        const article = await this.articleService.updateArticle(currentUserId, slug, updateArticleDto);
        return this.articleService.buildArticleResponse(article);

    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(@User('id') currentUserId: number, @Param('slug') slug: string) {
        return await this.articleService.deleteArticle(currentUserId, slug);
    }

    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    async likeArticle(@User('id') currentUserId: number, @Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articleService.likeArticle(currentUserId, slug);
        return this.articleService.buildArticleResponse(article);

    }

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async dislikeArticle(@User('id') currentUserId: number, @Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articleService.dislikeArticle(currentUserId, slug);
        return this.articleService.buildArticleResponse(article);
    }


}
