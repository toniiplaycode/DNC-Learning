import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OllamaService {
  private readonly baseUrl = 'http://localhost:11434/api';

  async generate(
    prompt: string,
    model: string = 'llama2',
    options?: any,
  ): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate`, {
        model,
        prompt,
        stream: false,
        ...options,
      });
      return response.data.response;
    } catch (error) {
      throw new Error(`Failed to generate text: ${error.message}`);
    }
  }

  async generateStream(
    prompt: string,
    model: string = 'llama2',
  ): Promise<AsyncGenerator<string>> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/generate`,
        {
          model,
          prompt,
          stream: true,
        },
        {
          responseType: 'stream',
        },
      );

      return (async function* () {
        for await (const chunk of response.data) {
          const lines = chunk.toString().split('\n').filter(Boolean);
          for (const line of lines) {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
          }
        }
      })();
    } catch (error) {
      throw new Error(`Failed to generate stream: ${error.message}`);
    }
  }

  async getEmbedding(
    text: string,
    model: string = 'llama2',
  ): Promise<number[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/embeddings`, {
        model,
        prompt: text,
      });
      return response.data.embedding;
    } catch (error) {
      throw new Error(`Failed to get embedding: ${error.message}`);
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tags`);
      return response.data.models.map((model) => model.name);
    } catch (error) {
      throw new Error(`Failed to list models: ${error.message}`);
    }
  }
}
