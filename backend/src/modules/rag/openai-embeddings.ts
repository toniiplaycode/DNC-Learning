import { Embeddings } from '@langchain/core/embeddings';
import { OpenAIService } from '../openai/openai.service';

export class OpenAIEmbeddings extends Embeddings {
  constructor(private openaiService: OpenAIService) {
    super({});
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      documents.map((doc) => this.openaiService.getEmbedding(doc)),
    );
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.openaiService.getEmbedding(text);
  }
}
