import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { json } from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(json({ limit: '10mb' }));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}

bootstrap();
