import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProfileType } from './types/profile.type';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
    constructor(@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity) private readonly followsRepository: Repository<FollowEntity>) { };

    buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
        delete profile.email;
        return {
            profile
        }
    }


    async getProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
        const user = await this.usersRepository.findOne({ where: { username: profileUsername } });
        if (!user) {
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
        }

        const follow = await this.followsRepository.findOne({ where: { followerId: currentUserId, followingId: user.id } });
        return {
            ...user,
            following: Boolean(follow)
        }

    }

    async followProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
        const user = await this.usersRepository.findOne({ where: { username: profileUsername } });
        if (!user) {
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
        }

        if (currentUserId === user.id) {
            throw new HttpException('Follower and following can not be equal', HttpStatus.BAD_REQUEST);

        }

        const follow = await this.followsRepository.findOne({ where: { followerId: currentUserId, followingId: user.id } });

        if (!follow) {
            const followToCreate = new FollowEntity();
            followToCreate.followerId = currentUserId;
            followToCreate.followingId = user.id;
            await this.followsRepository.save(followToCreate);
        }
        return { ...user, following: true };
    }


    async unfollowProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
        const user = await this.usersRepository.findOne({ where: { username: profileUsername } });
        if (!user) {
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
        }

        if (currentUserId === user.id) {
            throw new HttpException('Follower and following can not be equal', HttpStatus.BAD_REQUEST);

        }

        await this.followsRepository.delete({
            followerId: currentUserId,
            followingId: user.id
        })

        return { ...user, following: false };
    }

}
