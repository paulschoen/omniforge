import { Args, Query, Resolver } from '@nestjs/graphql';
import { DatasheetsService } from './datasheet.service';
import { DatasheetType } from './dto/datasheet.graphql';
import { Logger, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Resolver(() => DatasheetType)
export class DatasheetsResolver {
  private readonly logger = new Logger(DatasheetsResolver.name);
  constructor(private datasheetsService: DatasheetsService) {}

  @Query(() => [DatasheetType])
  @UseGuards(ApiKeyGuard)
  async getDatasheets(): Promise<DatasheetType[]> {
    try {
      const datasheets = await this.datasheetsService.findAll();
      return datasheets.map((datasheet) => ({
        ...datasheet,
        _id: datasheet._id.toString(),
      }));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  @Query(() => DatasheetType)
  @UseGuards(ApiKeyGuard)
  async getDatasheetById(
    @Args('_id') _id: string
  ): Promise<DatasheetType | null> {
    try {
      const datasheet = await this.datasheetsService.findById(_id);
      if (!datasheet) {
        return null;
      }
      return {
        ...datasheet,
        _id: datasheet._id.toString(),
      };
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  @Query(() => [DatasheetType])
  @UseGuards(ApiKeyGuard)
  async getDatasheetsByName(
    @Args('name') name: string
  ): Promise<DatasheetType[]> {
    try {
      const datasheets = await this.datasheetsService.findByName(name);
      return datasheets.map((datasheet) => ({
        ...datasheet,
        _id: datasheet._id.toString(),
      }));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  @Query(() => [DatasheetType])
  @UseGuards(ApiKeyGuard)
  async searchDatasheetsByName(
    @Args('name') name: string
  ): Promise<DatasheetType[]> {
    try {
      const datasheets = await this.datasheetsService.searchByName(name);
      return datasheets.map((datasheet) => ({
        ...datasheet,
        _id: datasheet._id.toString(),
      }));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }
}
