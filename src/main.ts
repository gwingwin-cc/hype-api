import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { json } from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(json({ limit: '10mb' }));
  app.useGlobalPipes(new ValidationPipe());

  const documentConfig = new DocumentBuilder()
    .setTitle('Hype API example')
    .setDescription('HypeSDK API description')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
