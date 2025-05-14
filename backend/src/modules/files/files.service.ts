import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly drive;

  constructor() {
    // Initialize Google Drive API client
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile:
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          path.join(process.cwd(), 'service-account.json'),
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      this.drive = google.drive({ version: 'v3', auth });
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive API client', error);
      throw new InternalServerErrorException(
        'Google Drive API initialization failed',
      );
    }
  }

  /**
   * Upload a file to Google Drive
   * @param file The file to upload
   * @returns The Google Drive file information including the URL
   */
  async uploadToDrive(file: Express.Multer.File) {
    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      if (!folderId) {
        throw new Error('Google Drive folder ID not configured');
      }

      // Create metadata for the file
      const fileMetadata = {
        name: file.originalname,
        parents: [folderId],
      };

      // Create media
      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      };

      // Upload file to Drive
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink',
      });

      // Make file publicly accessible
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Refresh to get updated links
      const fileInfo = await this.drive.files.get({
        fileId: response.data.id,
        fields: 'id,name,webViewLink,webContentLink',
      });

      // Clean up the temporary file
      fs.unlinkSync(file.path);

      // Loại bỏ phần query string từ webContentLink
      let directLink = '';
      if (fileInfo.data.webContentLink) {
        directLink = fileInfo.data.webContentLink.split('?')[0];
      }

      // Tạo URL trực tiếp có thể nhúng dựa trên loại file
      let embedUrl = '';
      const mimeType = file.mimetype;
      const fileId = fileInfo.data.id;

      if (mimeType.includes('image')) {
        // Đối với hình ảnh, sử dụng URL trực tiếp
        embedUrl = `https://drive.google.com/uc?id=${fileId}`;
      } else if (mimeType.includes('video')) {
        // Đối với video, sử dụng URL nhúng
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      } else if (mimeType.includes('pdf')) {
        // Đối với PDF
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      } else if (
        mimeType.includes('presentation') ||
        mimeType.includes('spreadsheet') ||
        mimeType.includes('document')
      ) {
        // Đối với Google Docs, Sheets, Slides
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      } else {
        // Mặc định cho các file khác
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      }

      return {
        id: fileInfo.data.id,
        name: fileInfo.data.name,
        viewUrl: fileInfo.data.webViewLink,
        downloadUrl: fileInfo.data.webContentLink,
        fileUrl: embedUrl,
        directLink:
          directLink ||
          `https://drive.google.com/uc?export=download&id=${fileId}`,
        embedUrl: embedUrl,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to Google Drive', error);
      // Clean up temporary file if it exists
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new InternalServerErrorException(
        `Google Drive upload failed: ${error.message}`,
      );
    }
  }
}
