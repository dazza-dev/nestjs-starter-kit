import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
  @IsString({ message: i18nValidationMessage('validation.token.string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.token.required') })
  token: string;

  @IsString({ message: i18nValidationMessage('validation.email.string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.email.required') })
  @IsEmail({}, { message: i18nValidationMessage('validation.email.email') })
  email: string;

  @IsString({ message: i18nValidationMessage('validation.password.string') })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.password.required'),
  })
  @MinLength(8, { message: i18nValidationMessage('validation.password.min') })
  password: string;
}
