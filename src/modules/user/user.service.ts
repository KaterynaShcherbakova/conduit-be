import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>) { }

    buildUserResponse(user: UserEntity): UserResponseInterface {
        return {
            user: {
                ...user,
                token: this.generateToken(user)
            }
        }
    }

    generateToken(user: UserEntity): string {
        return sign({
            id: user.id,
            username: user.username,
            email: user.email
        }, process.env.JWT_SECRET)
    }

    async findUserById(id: number): Promise<UserEntity> {
        return this.userRepository.findOne({ where: { id } });
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({ where: { email: createUserDto.email } })
        const userByUsername = await this.userRepository.findOne({ where: { username: createUserDto.username } })
        const errorResponse = {
            errors: {}
        }

        if (userByEmail) {
            errorResponse.errors['email'] = 'Email has already been taken'
        }

        if (userByUsername) {
            errorResponse.errors['username'] = 'Username has already been taken'
        }

        if (userByEmail || userByUsername) {
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        return await this.userRepository.save(newUser);
    }

    async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const errorResponse = {
            errors: {
                'email or password': 'is invalid'
            }
        }
        const user = await this.userRepository.findOne({
            where: { email: loginUserDto.email },
            select: ['id', 'email', 'username', 'bio', 'password', 'image']
        });
        if (!user) {
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const passwordMatch = await compare(loginUserDto.password, user.password,);

        if (!passwordMatch) {
            throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
        }
        delete user.password;
        return user;
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        const user = await this.findUserById(id);
        Object.assign(user, updateUserDto);
        return await this.userRepository.save(user);
    }

}
