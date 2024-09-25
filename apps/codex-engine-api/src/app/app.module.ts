import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { DatasheetsModule } from './datasheet/datasheet.module';
import { GridFsModule } from './grid-fs/grid-fs.module';
import { GridFSService } from './grid-fs/grid-fs.service';

const connection =
  process.env.MONGODB_CONNECTION_STRING ??
  'mongodb://localhost:27017/codex-engine';
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    MongooseModule.forRoot(connection),
    DatasheetsModule,
    GridFsModule,
  ],
  providers: [GridFSService],
})
export class AppModule {}
