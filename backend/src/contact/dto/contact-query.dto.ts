import { Transform } from 'class-transformer';
import { IsOptional, IsEnum, MaxLength, IsEmail } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export enum ContactMessageStatus {
  Unread = 'UNREAD',
  Read = 'READ',
}

export class ContactQueryDto extends PaginationQueryDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsEnum(ContactMessageStatus)
  status?: ContactMessageStatus;
}