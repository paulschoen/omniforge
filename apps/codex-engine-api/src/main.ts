/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';

const FIVE_MEGABYTES = 5 * 1024 * 1024;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  app.use(
    graphqlUploadExpress({
      maxFileSize: FIVE_MEGABYTES,
      maxFieldSize: FIVE_MEGABYTES,
      maxFiles: 1,
    })
  );
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
