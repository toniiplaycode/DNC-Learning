import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DocumentType {
  PDF = 'pdf',
  WORD = 'docx',
  EXCEL = 'xlsx',
  VIDEO = 'video',
  IMAGE = 'image',
  OTHER = 'other',
}

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Type(() => Number)
  courseSectionId: number;

  @IsString()
  @IsUrl()
  fileUrl: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  fileType?: DocumentType;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  fileSize?: number;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  instructorId?: number;
}
