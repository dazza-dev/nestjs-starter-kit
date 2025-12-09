import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateUserDto {
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional()
  name?: string;

  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional()
  avatar?: string;

  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  @IsOptional()
  email?: string;

  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional()
  username?: string;

  @IsString({ message: i18nValidationMessage('validation.isString') })
  @MinLength(8, { message: i18nValidationMessage('validation.minLength') })
  @IsOptional()
  password?: string;
}
