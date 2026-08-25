import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class GroupDto {
  @IsString({ message: i18nValidationMessage('validation.name.string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.name.required') })
  name: string;
}
