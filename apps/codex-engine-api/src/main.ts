/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { AppModule } from './app/app.module';

const TEN_MEGABYTES = 10000000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT ?? '3000';
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
  app.use(
    graphqlUploadExpress({
      maxFileSize: TEN_MEGABYTES,
      maxFieldSize: TEN_MEGABYTES,
      maxFiles: 5,
    }),
  );
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap().catch((error: unknown) => {
  Logger.error('Error during bootstrap', error);
});
