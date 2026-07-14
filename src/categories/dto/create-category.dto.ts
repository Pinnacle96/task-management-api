import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Work' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name: string;
}
