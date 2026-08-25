import { IsIn, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * A sort criterion from the SPA, shaped like `sort_by[0]`.
 */
export class SortCriterionDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: i18nValidationMessage('validation.sort_by.order'),
  })
  order?: string;
}
