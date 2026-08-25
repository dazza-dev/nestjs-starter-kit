import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SortCriterionDto } from '@/common/dto/sort-criterion.dto';

/** Common parameters for paginated listings. */
export class QueryListDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: string;

  @IsOptional()
  perPage?: string;

  // Only the first criterion is used; the array keeps the shape the SPA sends.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortCriterionDto)
  sortBy?: SortCriterionDto[];

  @IsOptional()
  trashed?: string;
}
