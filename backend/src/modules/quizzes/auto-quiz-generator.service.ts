import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { ConfigService } from '@nestjs/config';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs';
import { QuizProgressGateway } from './quiz-progress.gateway';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

@Injectable()
export class AutoQuizGeneratorService {
  private readonly logger = new Logger(AutoQuizGeneratorService.name);
  private readonly CHUNK_SIZE = 5; // Tăng lên 5 câu hỏi mỗi lần
  private readonly MAX_PARALLEL_REQUESTS = 2; // Giữ nguyên số request song song để tránh quá tải

  constructor(
    private readonly openAIService: OpenAIService,
    private readonly configService: ConfigService,
    private readonly progressGateway: QuizProgressGateway,
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
          return pdfData.text.replace(/\s/g, '');
        case 'docx':
          const docxResult = await mammoth.extractRawText({
            buffer: fileBuffer,
          });
          return docxResult.value.replace(/\s/g, '');
        case 'txt':
          const text = fileBuffer.toString('utf-8');
          return text.replace(/\s/g, '');
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
        actualQuestionsGenerated: questions.length,
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
    let retryCount = 0;
    const MAX_RETRIES = 2; // Thêm số lần thử lại tối đa

    // Emit initial progress
    await this.progressGateway.emitProgress({
      totalQuestions: numQuestions,
      currentQuestions: 0,
      status: 'processing',
      message: 'Bắt đầu tạo câu hỏi...',
    });

    while (remaining > 0) {
      const currentChunkSize = Math.min(this.CHUNK_SIZE, remaining);

      // Emit progress before processing chunk
      await this.progressGateway.emitProgress({
        totalQuestions: numQuestions,
        currentQuestions: allQuestions.length,
        status: 'processing',
        message: `Đang tạo ${currentChunkSize} câu hỏi (${allQuestions.length + 1}-${allQuestions.length + currentChunkSize}/${numQuestions})...`,
      });

      const prompt = `
        Tạo ${currentChunkSize} câu hỏi trắc nghiệm dựa trên nội dung sau.
        YÊU CẦU:
        - Mỗi câu hỏi phải có 4 lựa chọn, chỉ 1 đáp án đúng
        - Đáp án đúng PHẢI TRÙNG với một trong 4 lựa chọn
        - Các lựa chọn phải khác biệt, không trùng lặp
        - Giải thích ngắn gọn (1-2 câu) tại sao đáp án đúng
        - Tất cả bằng tiếng Việt, rõ ràng
        - CHỈ trả về mảng JSON, không thêm text khác
        - Đảm bảo JSON hợp lệ theo cấu trúc:
        [
          {
            "question": "Câu hỏi...",
            "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"],
            "correctAnswer": "Một trong 4 lựa chọn trên",
            "explanation": "Giải thích ngắn gọn"
          }
        ]
        Lưu ý: Tạo đúng ${currentChunkSize} câu hỏi, không thiếu không thừa.
        Nội dung:
        ${content}
      `;

      try {
        // Tạo các câu hỏi song song nếu có thể
        const parallelRequests = Math.min(
          this.MAX_PARALLEL_REQUESTS,
          Math.ceil(currentChunkSize / this.CHUNK_SIZE),
        );
        const chunkPromises = Array(parallelRequests)
          .fill(null)
          .map(async () => {
            const response = await this.openAIService.generate(prompt);
            return this.parseAndValidateQuestions(response, currentChunkSize);
          });

        const results = await Promise.all(chunkPromises);
        const validQuestions = results.flat().filter((q) => q);

        if (validQuestions.length > 0) {
          allQuestions = allQuestions.concat(validQuestions);
          remaining -= validQuestions.length;
          chunkIndex++;
          retryCount = 0; // Reset retry count on success

          // Emit progress after successful chunk creation
          await this.progressGateway.emitProgress({
            totalQuestions: numQuestions,
            currentQuestions: allQuestions.length,
            status: 'processing',
            message: `Đã tạo thành công ${validQuestions.length} câu hỏi (${allQuestions.length}/${numQuestions})`,
          });
        } else {
          this.logger.warn(
            `Không tạo được câu hỏi hợp lệ cho chunk ${chunkIndex + 1}`,
          );

          // Thử lại với chunk size nhỏ hơn nếu còn cơ hội
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            const smallerChunkSize = Math.max(
              1,
              Math.floor(currentChunkSize / 2),
            );
            this.logger.log(
              `Thử lại với chunk size nhỏ hơn: ${smallerChunkSize} (lần thử ${retryCount}/${MAX_RETRIES})`,
            );

            await this.progressGateway.emitProgress({
              totalQuestions: numQuestions,
              currentQuestions: allQuestions.length,
              status: 'processing',
              message: `Thử lại với số lượng câu hỏi ít hơn (${smallerChunkSize} câu)...`,
            });

            continue;
          }

          await this.progressGateway.emitProgress({
            totalQuestions: numQuestions,
            currentQuestions: allQuestions.length,
            status: 'error',
            message: 'Không thể tạo câu hỏi hợp lệ từ nội dung này',
          });

          if (remaining > 1) {
            continue;
          }
          break;
        }
      } catch (error) {
        this.logger.error(`Error generating questions: ${error.message}`);
        await this.progressGateway.emitProgress({
          totalQuestions: numQuestions,
          currentQuestions: allQuestions.length,
          status: 'error',
          message: 'Lỗi khi tạo câu hỏi',
        });
        break;
      }
    }

    // Emit final progress
    await this.progressGateway.emitProgress({
      totalQuestions: numQuestions,
      currentQuestions: allQuestions.length,
      status: allQuestions.length > 0 ? 'completed' : 'error',
      message:
        allQuestions.length > 0
          ? `Hoàn thành tạo ${allQuestions.length} câu hỏi`
          : 'Không thể tạo được câu hỏi nào từ nội dung này',
    });

    if (allQuestions.length === 0) {
      throw new Error('Không tạo được câu hỏi hợp lệ nào từ nội dung file.');
    }

    return allQuestions.slice(0, numQuestions);
  }

  private async parseAndValidateQuestions(
    response: string,
    expectedCount: number,
  ): Promise<QuizQuestion[]> {
    // Parse JSON response
    let jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
    let jsonStr = '';

    if (!jsonMatch) {
      const lastBracket = response.lastIndexOf(']');
      if (lastBracket !== -1) {
        jsonStr = response.slice(0, lastBracket + 1);
      } else {
        return [];
      }
    } else {
      jsonStr = jsonMatch[0];
    }

    try {
      const questions = JSON.parse(jsonStr);

      // Validate và lọc câu hỏi hợp lệ
      return questions.filter(
        (q: QuizQuestion) =>
          q &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctAnswer === 'string' &&
          typeof q.explanation === 'string' &&
          q.options.includes(q.correctAnswer) &&
          // Thêm validation cho độ dài
          q.question.length >= 10 &&
          q.explanation.length >= 10 &&
          q.options.every((opt) => opt.length >= 2),
      );
    } catch (e) {
      this.logger.error(`JSON Parse Error: ${e.message}`);
      return [];
    }
  }

  async extractTextFromBuffer(
    fileBuffer: Buffer,
    fileType: string,
  ): Promise<string> {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        const pdfData = await pdf(fileBuffer);
        return pdfData.text.replace(/\s/g, '');
      case 'docx':
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        return docxResult.value.replace(/\s/g, '');
      case 'txt':
        const text = fileBuffer.toString('utf-8');
        return text.replace(/\s/g, '');
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}
