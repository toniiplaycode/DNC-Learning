import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto, DocumentType } from './create-document.dto';
import {
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus } from 'src/entities/Document';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  instructorId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  courseSectionId?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  fileType?: DocumentType;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  uploadDate?: Date;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  downloadCount?: number;

  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}
