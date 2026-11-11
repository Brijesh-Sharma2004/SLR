import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { ResourceType } from '../../database/schemas/resource.schema.js';

export class CreateResourceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  url: string;

  @IsString()
  @MinLength(1)
  @MaxLength(24)
  subjectId: string;
}