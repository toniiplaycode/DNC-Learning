import { Controller, Post, Body, Get } from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('generate')
  async generate(
    @Body('prompt') prompt: string,
    @Body('model') model?: string,
  ) {
    return this.ollamaService.generate(prompt, model);
  }

  @Post('embedding')
  async getEmbedding(
    @Body('text') text: string,
    @Body('model') model?: string,
  ) {
    return this.ollamaService.getEmbedding(text, model);
  }

  @Get('models')
  async listModels() {
    return this.ollamaService.listModels();
  }
}
