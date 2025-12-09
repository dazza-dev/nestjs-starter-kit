import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ListUsersQueryDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.isString') })
  search?: string;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  @Max(100, { message: i18nValidationMessage('validation.max') })
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsIn(['name', 'email', 'createdAt', 'updatedAt'], {
    message: i18nValidationMessage('validation.isIn'),
  })
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsIn(['asc', 'desc'], { message: i18nValidationMessage('validation.isIn') })
  sortOrder?: 'asc' | 'desc';
}
