import { Args, Query, Resolver } from '@nestjs/graphql';
import { DatasheetsService } from './datasheet.service';
import { DatasheetType } from './dto/datasheet.graphql';

@Resolver(() => DatasheetType)
export class DatasheetsResolver {
  constructor(private datasheetsService: DatasheetsService) {}

  @Query(() => [DatasheetType])
  async getDatasheetsByName(
    @Args('name') name: string
  ): Promise<DatasheetType[]> {
    const datasheets = await this.datasheetsService.findByName(name);
    return datasheets.map((datasheet) => ({
      ...datasheet,
      _id: datasheet._id.toString(),
    }));
  }
}
