import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          // Generate unique filename with original extension
          const randomName = crypto.randomBytes(16).toString('hex');
          const originalExt = path.extname(file.originalname);
          cb(null, `${randomName}${originalExt}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
      },
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    this.logger.log(`Uploading file: ${file.originalname}`);

    const result = await this.filesService.uploadToDrive(file);

    return {
      success: true,
      fileUrl: result.fileUrl, // URL có thể nhúng trực tiếp
      fileName: result.name,
      fileId: result.id,
      viewUrl: result.viewUrl, // Link để xem trong Drive
      downloadUrl: result.downloadUrl, // Link để tải xuống
      directLink: result.directLink, // Link trực tiếp không có query
      embedUrl: result.embedUrl, // URL để nhúng
      mimeType: result.mimeType, // Loại file
    };
  }
}
