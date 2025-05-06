import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { OpenAIService } from '../openai/openai.service';
import { OpenAIEmbeddings } from './openai-embeddings';
import * as removeAccents from 'remove-accents';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly qdrantClient: QdrantClient;
  private readonly embeddings: OpenAIEmbeddings;
  private readonly vectorStore: QdrantVectorStore;
  private readonly collectionName = 'chatbot_documents';

  constructor(
    private configService: ConfigService,
    private openaiService: OpenAIService,
  ) {
    // Initialize Qdrant client
    const qdrantUrl = this.configService.get<string>(
      'QDRANT_URL',
      'http://localhost:6333',
    );
    const qdrantApiKey = this.configService.get<string>('QDRANT_API_KEY');

    // Only use HTTPS if not localhost
    const secureUrl = qdrantUrl.includes('localhost')
      ? qdrantUrl
      : qdrantUrl.replace('http://', 'https://');

    this.qdrantClient = new QdrantClient({
      url: secureUrl,
      apiKey: qdrantApiKey,
    });

    // Initialize embeddings
    this.embeddings = new OpenAIEmbeddings(this.openaiService);

    // Initialize vector store
    this.vectorStore = new QdrantVectorStore(this.embeddings, {
      client: this.qdrantClient,
      collectionName: this.collectionName,
    });

    // Initialize collection with correct vector size
    this.initializeCollection();
  }

  private async initializeCollection() {
    try {
      // Check if collection exists
      const collections = await this.qdrantClient.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName,
      );

      if (!exists) {
        // Chỉ tạo mới nếu chưa có
        await this.qdrantClient.createCollection(this.collectionName, {
          vectors: {
            size: 1536,
            distance: 'Cosine',
          },
        });
        this.logger.log(`Created collection ${this.collectionName}`);
      } else {
        this.logger.log(
          `Collection ${this.collectionName} already exists, skip creating.`,
        );
      }
    } catch (error) {
      this.logger.error('Error initializing collection:', error);
      throw error;
    }
  }

  async addDocuments(documents: string[]): Promise<void> {
    try {
      const embeddings = await Promise.all(
        documents.map((doc) => this.openaiService.getEmbedding(doc)),
      );
      const points = documents.map((doc, i) => ({
        id: i,
        vector: embeddings[i],
        payload: { text: doc },
      }));

      await this.qdrantClient.upsert(this.collectionName, {
        points,
      });
      // Thêm document chào hỏi hoặc giao tiếp
      const greetingDoc =
        'Xin chào! Tôi là trợ lý AI, rất vui được gặp bạn. Bạn có thể hỏi tôi về các khóa học, thông tin, hoặc bất kỳ điều gì khác. Tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể.';
      const greetingEmbedding =
        await this.openaiService.getEmbedding(greetingDoc);
      await this.qdrantClient.upsert(this.collectionName, {
        points: [
          {
            id: points.length,
            vector: greetingEmbedding,
            payload: { text: greetingDoc },
          },
        ],
      });
    } catch (error) {
      this.logger.error('Error adding documents:', error);
      throw error;
    }
  }

  async keywordSearch(query: string): Promise<string[]> {
    try {
      const result = await this.qdrantClient.scroll(this.collectionName, {
        limit: 1000,
        with_payload: true,
        with_vector: false,
      });
      // Chuẩn hóa query
      const normalize = (str: string) =>
        removeAccents(str.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, ' '));
      const queryWords = normalize(query).split(' ').filter(Boolean);

      const matched = result.points.filter((point) => {
        if (!point.payload || typeof point.payload.text !== 'string')
          return false;
        const textNorm = normalize(point.payload.text);
        const isMatch = queryWords.every((word) => textNorm.includes(word));
        this.logger.debug(
          `[KeywordSearch] QueryWords: ${JSON.stringify(queryWords)} | TextNorm: "${textNorm}" | isMatch: ${isMatch}`,
        );
        // Tất cả từ trong query đều xuất hiện trong text
        return isMatch;
      });
      this.logger.debug(`Keyword search found ${matched.length} results`);
      return matched
        .map((point) =>
          point.payload && typeof point.payload.text === 'string'
            ? point.payload.text
            : '',
        )
        .filter(Boolean);
    } catch (error) {
      this.logger.error('Error in keyword search:', error);
      return [];
    }
  }

  async generateResponse(query: string, context: string[]) {
    try {
      this.logger.debug('Context for prompt:', context);
      const prompt = `Bạn là trợ lý AI thân thiện. Hãy trả lời câu hỏi sau bằng tiếng Việt dựa trên ngữ cảnh bên dưới.
      - Ưu tiên sử dụng thông tin trong ngữ cảnh để trả lời.
      - Nếu ngữ cảnh không đủ thông tin, hãy nói rõ là không tìm thấy thông tin phù hợp.
      - Trả lời ngắn gọn, dễ hiểu.

      Ngữ cảnh:
      ${context.join('\n')}

      Câu hỏi: ${query}

      Trả lời:`;

      const response = await this.openaiService.generate(prompt);
      return response;
    } catch (error) {
      this.logger.error('Error generating response:', error);
      throw error;
    }
  }

  async testRag(query: string) {
    try {
      this.logger.debug(`[RAG] User question: "${query}"`);

      // Chuẩn hóa câu hỏi và tách từ khóa
      const normalize = (str: string) =>
        removeAccents(str.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, ' '));
      const keywords = normalize(query)
        .split(' ')
        .filter((word) => !!word);
      this.logger.debug(`[RAG] Normalized keywords:`, keywords);

      // Lấy toàn bộ vector từ Qdrant
      const result = await this.qdrantClient.scroll(this.collectionName, {
        limit: 1000,
        with_payload: true,
        with_vector: false,
      });

      // So khớp từ khóa với từng vector
      const scoredVectors = result.points
        .map((point) => {
          if (!point.payload || typeof point.payload.text !== 'string')
            return null;
          const textNorm = normalize(point.payload.text);
          const matchedKeywords = keywords.filter((keyword) =>
            textNorm.includes(keyword),
          );
          const score = matchedKeywords.length;
          if (score > 0) {
            this.logger.debug(
              `[RAG] Vector match: "${point.payload.text}" | Matched keywords: ${JSON.stringify(matchedKeywords)} | Score: ${score}`,
            );
          }
          return {
            text: point.payload.text,
            score,
            matchedKeywords,
          };
        })
        .filter(
          (
            item,
          ): item is {
            text: string;
            score: number;
            matchedKeywords: string[];
          } => item !== null,
        );

      // Lấy các vector có score > 0, sắp xếp giảm dần, lấy top 5
      const matchedVectors = scoredVectors
        .filter((v) => v.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      const context = matchedVectors.map((v) => v.text);
      this.logger.debug(`[RAG] Final context for prompt:`, context);

      let response;
      if (context.length === 0) {
        response =
          'Tôi không tìm thấy thông tin phù hợp. Bạn hãy hỏi đầy đủ tên khóa học hoặc mô tả chi tiết để được trả lời chính xác.';
      } else {
        response = await this.generateResponse(query, context);
      }

      return {
        success: true,
        searchResults: context,
        response,
      };
    } catch (error) {
      this.logger.error('Error in testRag:', error);
      return { success: false, error: error.message };
    }
  }

  async listVectors() {
    try {
      const result = await this.qdrantClient.scroll(this.collectionName, {
        limit: 100,
        with_payload: true,
        with_vector: false,
      });

      return {
        success: true,
        total: result.points.length,
        vectors: result.points.map((point) => ({
          id: point.id,
          text: point.payload?.text || '',
        })),
      };
    } catch (error) {
      this.logger.error('Error listing vectors:', error);
      return { success: false, error: error.message };
    }
  }

  async clearAllVectors() {
    await this.qdrantClient.deleteCollection(this.collectionName);
    await this.qdrantClient.createCollection(this.collectionName, {
      vectors: {
        size: 1536,
        distance: 'Cosine',
      },
    });
  }
}
