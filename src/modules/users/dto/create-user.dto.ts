import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserDto {
  @IsString({ message: i18nValidationMessage('validation.first_name.string') })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.first_name.required'),
  })
  firstName: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.last_name.string') })
  lastName?: string;

  @IsEmail({}, { message: i18nValidationMessage('validation.email.email') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.email.required') })
  email: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.phone.string') })
  phone?: string;

  @IsString({ message: i18nValidationMessage('validation.username.string') })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.username.required'),
  })
  username: string;

  @IsString({ message: i18nValidationMessage('validation.password.string') })
  @MinLength(8, { message: i18nValidationMessage('validation.password.min') })
  password: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: i18nValidationMessage('validation.status.in'),
  })
  status?: string;

  // A user needs at least one role to have permissions.
  @ArrayNotEmpty({
    message: i18nValidationMessage('validation.role_uuids.required'),
  })
  @IsArray({ message: i18nValidationMessage('validation.role_uuids.required') })
  roleUuids: string[];
}
