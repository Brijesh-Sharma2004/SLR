import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ResourceType } from '../../database/schemas/resource.schema.js';

export class UploadResourceDto {
  @ApiProperty({ required: true })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @ApiProperty({ enum: ResourceType, required: true })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(1)
  @MaxLength(24)
  subjectId: string;
}