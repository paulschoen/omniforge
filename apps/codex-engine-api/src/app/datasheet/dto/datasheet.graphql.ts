import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class DatasheetType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  faction_id: string;

  @Field()
  source_id: number;

  @Field()
  legend: string;

  @Field()
  role: string;

  @Field()
  loadout: string;

  @Field()
  virtual: boolean;

  @Field()
  link: string;
}
