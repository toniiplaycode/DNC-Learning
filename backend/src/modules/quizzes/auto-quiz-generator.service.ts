import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { ConfigService } from '@nestjs/config';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs';

@Injectable()
export class AutoQuizGeneratorService {
  private readonly logger = new Logger(AutoQuizGeneratorService.name);

  constructor(
    private readonly openAIService: OpenAIService,
    private readonly configService: ConfigService,
  ) {}

  async extractTextFromFile(
    filePath: string,
    fileType: string,
  ): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);

      switch (fileType.toLowerCase()) {
        case 'pdf':
          const pdfData = await pdf(fileBuffer);
          return pdfData.text;
        case 'docx':
          const docxResult = await mammoth.extractRawText({
            buffer: fileBuffer,
          });
          return docxResult.value;
        case 'txt':
          return fileBuffer.toString('utf-8');
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      this.logger.error(`Error extracting text from file: ${error.message}`);
      throw error;
    }
  }

  async generateQuizFromContent(
    content: string,
    numQuestions: number = 5,
  ): Promise<any> {
    try {
      const prompt = `
        Dựa vào nội dung bài học sau đây, hãy tạo ${numQuestions} câu hỏi trắc nghiệm.
        Mỗi câu hỏi phải có 4 lựa chọn và chỉ có một đáp án đúng.
        Hãy trả về dưới dạng mảng JSON với cấu trúc sau:
        [
          {
            "question": "nội dung câu hỏi",
            "options": ["lựa chọn 1", "lựa chọn 2", "lựa chọn 3", "lựa chọn 4"],
            "correctAnswer": "nội dung đáp án đúng",
            "explanation": "giải thích ngắn gọn tại sao đây là đáp án đúng"
          }
        ]
        
        Lưu ý:
        - Tất cả câu hỏi và đáp án phải bằng tiếng Việt
        - Câu hỏi phải rõ ràng, dễ hiểu
        - Các lựa chọn phải có tính phân biệt
        - Giải thích phải ngắn gọn nhưng đầy đủ
        
        Nội dung bài học:
        ${content}
      `;

      const response = await this.openAIService.generate(prompt);

      // Loại bỏ markdown nếu có
      const cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.error(`Error generating quiz: ${error.message}`);
      throw error;
    }
  }

  async generateQuizFromFile(
    fileBuffer: Buffer,
    fileType: string,
    numQuestions: number = 5,
  ): Promise<any> {
    try {
      // Dùng extractTextFromBuffer thay vì extractTextFromFile
      const content = await this.extractTextFromBuffer(fileBuffer, fileType);

      // Generate quiz questions
      const questions = await this.generateQuizFromContent(
        content,
        numQuestions,
      );

      return {
        questions,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error generating quiz from buffer: ${error.message}`);
      throw error;
    }
  }

  async extractTextFromBuffer(
    fileBuffer: Buffer,
    fileType: string,
  ): Promise<string> {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        const pdfData = await pdf(fileBuffer);
        return pdfData.text;
      case 'docx':
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        return docxResult.value;
      case 'txt':
        return fileBuffer.toString('utf-8');
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}
