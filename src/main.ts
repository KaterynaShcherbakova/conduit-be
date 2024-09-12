import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './common/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seeder = app.get(SeederService);

  try {
    await seeder.seed();
    console.log('Seeding completed!');
  } catch (error) {
    console.error('Seeding failed', error);
  } 
  await app.listen(3000);
}
bootstrap();
