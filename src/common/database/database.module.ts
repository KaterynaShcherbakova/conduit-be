import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSourceOptions from 'src/common/database/database.source';
import { DataSourceOptions } from 'typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) =>
                configService.get<DataSourceOptions>('typeorm')
        }),
        ConfigModule.forRoot({ isGlobal: true, load: [dataSourceOptions] }),
    ]
})
export class DatabaseModule { }
