import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { ConfigService } from '@nestjs/config';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

@Injectable()
export class AutoQuizGeneratorService {
  private readonly logger = new Logger(AutoQuizGeneratorService.name);
  private readonly MAX_TOKENS = 2000; // Giới hạn độ dài nội dung cho mỗi lần tạo
  private readonly CHUNK_SIZE = 8; // hoặc 10, tuỳ mức ổn định của AI

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

  async generateQuizFromFile(
    fileBuffer: Buffer,
    fileType: string,
    numQuestions: number = 5,
  ): Promise<any> {
    try {
      this.logger.log(
        `Bắt đầu tạo quiz từ file. Số lượng câu hỏi yêu cầu: ${numQuestions}`,
      );
      // Validate input
      if (numQuestions < 1 || numQuestions > 50) {
        this.logger.warn(`Số lượng câu hỏi không hợp lệ: ${numQuestions}`);
        throw new Error('Số lượng câu hỏi phải từ 1 đến 50');
      }

      // Extract text from file
      const content = await this.extractTextFromBuffer(fileBuffer, fileType);
      const contentNoWhitespace = content.replace(/\s/g, ''); // Loại bỏ space, tab, xuống dòng
      const contentLength = contentNoWhitespace.length;

      // Tính số lượng câu hỏi tối đa dựa trên độ dài nội dung
      const maxQuestions = Math.max(1, Math.floor(contentLength / 300)); // 1 câu/300 ký tự

      // Thêm log chi tiết
      this.logger.log(
        `Nội dung file có ${contentLength} ký tự (không tính khoảng trắng). Dự đoán có thể tạo tối đa khoảng ${maxQuestions} câu hỏi trắc nghiệm chất lượng.`,
      );

      let warning: string | undefined = undefined;
      let finalNumQuestions = numQuestions;
      if (numQuestions > maxQuestions) {
        finalNumQuestions = maxQuestions;
        warning = `Nội dung file quá ngắn, chỉ có thể tạo tối đa ${maxQuestions} câu hỏi từ file này.`;
        this.logger.warn(warning);
      }

      // Gọi AI với số lượng câu hỏi hợp lý
      const questions = await this.generateQuestionsFromContent(
        content,
        finalNumQuestions,
      );

      this.logger.log(`Số câu hỏi hợp lệ nhận được từ AI: ${questions.length}`);

      this.logger.log('Hoàn thành tạo quiz từ file.');
      return {
        questions,
        generatedAt: new Date(),
        warning,
        contentLength,
        maxQuestions,
      };
    } catch (error) {
      this.logger.error(`Error generating quiz from buffer: ${error.message}`);
      throw error;
    }
  }

  private async generateQuestionsFromContent(
    content: string,
    numQuestions: number,
  ): Promise<QuizQuestion[]> {
    let allQuestions: QuizQuestion[] = [];
    let remaining = numQuestions;
    let chunkIndex = 0;

    while (remaining > 0) {
      const chunkSize = Math.min(this.CHUNK_SIZE, remaining);
      const prompt = `
        Tạo ${chunkSize} câu hỏi trắc nghiệm dựa trên nội dung sau.
        YÊU CẦU:
        - Mỗi câu hỏi phải có 4 lựa chọn (options), chỉ có 1 đáp án đúng (correctAnswer).
        - Đáp án đúng (correctAnswer) PHẢI TRÙNG KHỚP với một trong 4 lựa chọn phía trên.
        - Mỗi lựa chọn phải khác biệt, không trùng lặp, không chứa đáp án đúng nhiều lần.
        - Đáp án đúng phải là lựa chọn duy nhất đúng, các lựa chọn còn lại phải sai.
        - Mỗi câu hỏi cần có giải thích ngắn gọn (explanation) tại sao đáp án đúng là đúng.
        - Tất cả nội dung phải bằng tiếng Việt, rõ ràng, dễ hiểu.
        - CHỈ trả về mảng JSON, không thêm bất kỳ text nào khác.
        - Đảm bảo JSON hợp lệ, đúng cấu trúc sau:
        [
          {
            "question": "Câu hỏi...",
            "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"],
            "correctAnswer": "Một trong 4 lựa chọn phía trên",
            "explanation": "Giải thích ngắn gọn"
          }
        ]
        Nội dung:
        ${content}
      `;

      this.logger.log(
        `Gọi AI chunk ${chunkIndex + 1}, yêu cầu ${chunkSize} câu hỏi...`,
      );
      const response = await this.openAIService.generate(prompt);
      this.logger.debug(`AI response chunk ${chunkIndex + 1}: ${response}`);

      // Fallback: cắt đến dấu ] cuối cùng nếu không tìm thấy mảng JSON hợp lệ
      let jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
      let jsonStr = '';
      if (!jsonMatch) {
        const lastBracket = response.lastIndexOf(']');
        if (lastBracket !== -1) {
          jsonStr = response.slice(0, lastBracket + 1);
          this.logger.warn(
            'Không tìm thấy mảng JSON hợp lệ, thử cắt đến dấu ] cuối cùng.',
          );
        } else {
          throw new Error(
            'Không tìm thấy mảng JSON hợp lệ trong response của AI.',
          );
        }
      } else {
        jsonStr = jsonMatch[0];
      }

      let questions: QuizQuestion[] = [];
      try {
        questions = JSON.parse(jsonStr);
      } catch (e) {
        this.logger.error(
          `JSON Parse Error ở chunk ${chunkIndex + 1}: ${e.message}`,
        );
        continue; // Bỏ qua chunk lỗi, thử chunk tiếp theo
      }

      // Validate từng câu hỏi như cũ...
      const validQuestions = questions.filter(
        (q) =>
          q &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctAnswer === 'string' &&
          typeof q.explanation === 'string' &&
          q.options.includes(q.correctAnswer),
      );

      allQuestions = allQuestions.concat(validQuestions);
      remaining -= validQuestions.length;
      chunkIndex++;

      if (validQuestions.length === 0) {
        this.logger.warn(
          `Chunk ${chunkIndex} không tạo được câu hỏi hợp lệ nào.`,
        );
        break; // Nếu chunk này không tạo được câu nào, dừng luôn
      }
    }

    if (allQuestions.length === 0) {
      throw new Error(
        'Không tạo được câu hỏi hợp lệ nào từ nội dung file hoặc dữ liệu AI trả về không đúng định dạng.',
      );
    }

    return allQuestions.slice(0, numQuestions); // Trả về đúng số lượng yêu cầu nếu đủ
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
