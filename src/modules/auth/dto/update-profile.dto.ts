import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.first_name.string') })
  firstName?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.last_name.string') })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.email.email') })
  email?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.phone.string') })
  phone?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.username.string') })
  username?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.password.string') })
  @MinLength(8, { message: i18nValidationMessage('validation.password.min') })
  password?: string;
}
