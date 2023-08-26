import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { json } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(json({ limit: '10mb' }));
  await app.listen(3000);
}

bootstrap();
