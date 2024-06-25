import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CardInfoDto {
  @ApiProperty()
  @IsString()
  cardBrand: string;

  @ApiProperty()
  @IsString()
  lastFourDigits: string;
}
