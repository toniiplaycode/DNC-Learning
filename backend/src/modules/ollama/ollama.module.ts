import { Module } from '@nestjs/common';
import { OllamaController } from './ollama.controller';
import { OllamaService } from './ollama.service';

@Module({
  providers: [OllamaService],
  controllers: [OllamaController],
  exports: [OllamaService],
})
export class OllamaModule {}
