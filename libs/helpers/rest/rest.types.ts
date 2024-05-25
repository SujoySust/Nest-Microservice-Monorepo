import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional } from 'class-validator';

export class CountModel {
  @ApiProperty()
  count: number;
}

export class ResponseModel<TData = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  messages: string[];

  @ApiProperty()
  code: number;

  @ApiPropertyOptional()
  data?: TData;
}

// LimitOffsetPaginationArgs
export class LOPaginationArgsDto {
  @ApiPropertyOptional()
  @IsInt()
  // @Transform((obj) => transDtoValue({ ...obj, trans_type: Number }))
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsInt()
  // @Transform((obj) => transDtoToNumber(obj))
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  sort_col?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['desc', 'asc'])
  sort_dir?: string;
}

// LimitOffsetPaginatedData
export class LOPaginatedData<TModel> {
  @ApiProperty()
  list: TModel[];

  @ApiProperty()
  total_count: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class CodeVerifyInputs {
  @ApiProperty()
  code: string;

  @ApiProperty()
  method: number;

  @ApiProperty()
  event: number;
}

export class UserModel {
  id: number | bigint | string;
  email: string;
  phone: string;
}
