import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { DatasheetService } from './datasheet.service';
import { DatasheetType } from './dto/datasheet.graphql';

@Resolver(() => DatasheetType)
export class DatasheetsResolver {
  private readonly logger = new Logger(DatasheetsResolver.name);
  constructor(private datasheetsService: DatasheetService) {}

  @Query(() => [DatasheetType])
  @UseGuards(ApiKeyGuard)
  async getDatasheets(): Promise<DatasheetType[]> {
    try {
      const datasheets = await this.datasheetsService.findAll();
      return datasheets.map((datasheet) => ({
        ...datasheet,
      }));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  @Query(() => DatasheetType)
  @UseGuards(ApiKeyGuard)
  async getDatasheetById(
    @Args('_id') _id: string,
  ): Promise<DatasheetType | null> {
    try {
      const datasheet = await this.datasheetsService.findById(_id);
      if (!datasheet) {
        return null;
      }
      return {
        ...datasheet,
      };
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  @Query(() => [DatasheetType])
  @UseGuards(ApiKeyGuard)
  async getDatasheetsByName(
    @Args('name') name: string,
  ): Promise<DatasheetType[]> {
    try {
      const datasheets = await this.datasheetsService.findByName(name);
      return datasheets.map((datasheet) => ({
        ...datasheet,
      }));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  @Query(() => [DatasheetType])
  @UseGuards(ApiKeyGuard)
  async searchDatasheetsByName(
    @Args('name') name: string,
  ): Promise<DatasheetType[]> {
    try {
      const datasheets = await this.datasheetsService.searchByName(name);
      return datasheets.map((datasheet) => ({
        ...datasheet,
      }));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  @Mutation(() => String)
  @UseGuards(ApiKeyGuard)
  async uploadImage(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @Args('id', { type: () => String }) datasheetId: string,
  ): Promise<string> {
    try {
      const response = await this.datasheetsService.uploadImage(
        file,
        datasheetId,
      );
      return response;
    } catch (error) {
      this.logger.error(error);
      return '';
    }
  }

  @Query(() => String)
  @UseGuards(ApiKeyGuard)
  async downloadImage(@Args('id') id: string): Promise<string> {
    try {
      return await this.datasheetsService.downloadImage(id);
    } catch (error) {
      this.logger.error(error);
      return '';
    }
  }
}
