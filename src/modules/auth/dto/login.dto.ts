import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @IsString({ message: i18nValidationMessage('validation.username.string') })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.username.required'),
  })
  username: string;

  @IsString({ message: i18nValidationMessage('validation.password.string') })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.password.required'),
  })
  password: string;
}
