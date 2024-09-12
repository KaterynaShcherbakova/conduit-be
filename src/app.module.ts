import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TagModule } from './modules/tag/tag.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { UserModule } from './modules/user/user.module';
import dataSourceOptions from './common/database/database.source';
import { AuthMiddleware } from './modules/user/middleware/auth.middleware';
import { ArticleModule } from './modules/article/article.module';
import { SeederService } from './common/seeder/seeder.service';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [dataSourceOptions] }),
    TagModule,
    DatabaseModule,
    UserModule,
    ArticleModule,
    ProfileModule
  ],
  controllers: [],
  providers: [SeederService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    })
  }
}
