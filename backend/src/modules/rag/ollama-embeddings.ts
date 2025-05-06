import { Embeddings } from '@langchain/core/embeddings';
import { OllamaService } from '../ollama/ollama.service';

export class OllamaEmbeddings extends Embeddings {
  constructor(private ollamaService: OllamaService) {
    super({});
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      documents.map((doc) => this.ollamaService.getEmbedding(doc)),
    );
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.ollamaService.getEmbedding(text);
  }
}
