import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';

/**
 * On edit the password is optional: if it's not sent, the current one is kept.
 */
export class UpdateUserDto extends PartialType(
  // roleUuids is excluded from inheritance: PartialType would make it optional, and it stays required.
  OmitType(CreateUserDto, ['password', 'roleUuids'] as const),
) {
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.password.string') })
  @MinLength(8, { message: i18nValidationMessage('validation.password.min') })
  password?: string;

  @ArrayNotEmpty({
    message: i18nValidationMessage('validation.role_uuids.required'),
  })
  @IsArray({ message: i18nValidationMessage('validation.role_uuids.required') })
  roleUuids: string[];
}
