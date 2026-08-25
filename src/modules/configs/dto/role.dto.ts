import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RoleDto {
  @IsString({
    message: i18nValidationMessage('validation.display_name.required'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.display_name.required'),
  })
  displayName: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.description.string') })
  description?: string;
}
