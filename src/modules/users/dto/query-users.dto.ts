import { IsOptional, IsString } from 'class-validator';
import { QueryListDto } from '@/common/dto/query-list.dto';

/**
 * Adds user-specific filters on top of the common listing.
 */
export class QueryUsersDto extends QueryListDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  roleUuid?: string;
}
