import { NestFactory } from '@nestjs/core';

import { json } from 'body-parser';
import { InternalModule } from './internal.module';

async function bootstrap() {
  const app = await NestFactory.create(InternalModule);
  app.use(json({ limit: '10mb' }));
  await app.listen(3030);
}

bootstrap();
