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
  SLIDE = 'slide', // Added for presentations
  CODE = 'code', // Added for code files
  LINK = 'link', // Added for external links
  TXT = 'txt', // Added for text files
  DOCX = 'docx', // Renamed from WORD
  XLSX = 'xlsx', // Renamed from EXCEL
}

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional() // Changed to optional to match frontend
  description?: string;

  @IsNumber()
  @IsOptional() // Changed to optional to match frontend
  @Type(() => Number)
  courseSectionId?: number;

  @IsString()
  @IsUrl()
  fileUrl: string;

  @IsEnum(DocumentType)
  @IsNotEmpty() // Changed to required to match frontend
  fileType: DocumentType;

  @IsNumber()
  @IsNotEmpty() // Changed to required to match frontend
  @Type(() => Number)
  instructorId: number;
}
