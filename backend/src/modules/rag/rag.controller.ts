import { Controller, Post, Body, Get } from '@nestjs/common';
import { RagService } from './rag.service';
import { OpenAIService } from '../openai/openai.service';

@Controller('rag-test')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly openaiService: OpenAIService,
  ) {}

  @Post('test-openai')
  async testOpenAI(@Body('prompt') prompt: string) {
    try {
      const response = await this.openaiService.generate(prompt);
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('test-embeddings')
  async testEmbeddings(@Body('text') text: string) {
    try {
      const embedding = await this.openaiService.getEmbedding(text);
      return {
        success: true,
        embeddingSize: embedding.length,
        embeddingPreview: embedding.slice(0, 5), // Show first 5 dimensions
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('test-rag')
  async testRag(@Body() body: { query: string }) {
    return this.ragService.testRag(body.query);
  }

  @Post('add-documents')
  async addDocuments(@Body('documents') documents: string[]) {
    try {
      await this.ragService.addDocuments(documents);
      return { success: true, message: 'Documents added to Qdrant' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('list-vectors')
  async listVectors() {
    return this.ragService.listVectors();
  }
}
