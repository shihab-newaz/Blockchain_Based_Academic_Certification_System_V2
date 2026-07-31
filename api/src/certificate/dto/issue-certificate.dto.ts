import { IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IssueCertificateDto {
  @IsString()
  studentName!: string;

  @IsString()
  roll!: string;

  @IsString()
  degreeName!: string;

  @IsString()
  subject!: string;

  @IsString()
  studentAddress!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  expiry!: number;
}
