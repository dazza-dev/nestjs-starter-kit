import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RequestPasswordResetDto {
  @IsString({ message: i18nValidationMessage('validation.email.string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.email.required') })
  @IsEmail({}, { message: i18nValidationMessage('validation.email.email') })
  email: string;
}
