import { Command, CommandRunner } from 'nest-commander';
import { ChatbotAnalyzerService } from './chatbot-analyzer.service';

@Command({ name: 'analyze-chatbot-data' })
export class AnalyzeChatbotDataCommand extends CommandRunner {
  constructor(private analyzerService: ChatbotAnalyzerService) {
    super();
  }

  async run(): Promise<void> {
    console.log('🔄 Bắt đầu phân tích dữ liệu cho chatbot...');

    try {
      await this.analyzerService.analyzeDatabaseAndGenerateResponses();
      console.log('✅ Đã hoàn thành phân tích và cập nhật dữ liệu chatbot');
    } catch (error) {
      console.error('❌ Lỗi khi phân tích dữ liệu:', error);
    }
  }
}
