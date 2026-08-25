import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SettingValueDto {
  @IsString({ message: i18nValidationMessage('validation.name.string') })
  name: string;

  @IsOptional()
  value?: string | number | boolean | null;
}

export class UpdateSettingsDto {
  @IsArray({ message: i18nValidationMessage('validation.settings.array') })
  @ValidateNested({ each: true })
  @Type(() => SettingValueDto)
  settings: SettingValueDto[];
}
