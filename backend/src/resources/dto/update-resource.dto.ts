import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ResourceType } from '../../database/schemas/resource.schema.js';
import type { CreateResourceDto } from './create-resource.dto.js';

export class UpdateResourceDto implements Partial<CreateResourceDto> {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(24)
  subjectId?: string;
}