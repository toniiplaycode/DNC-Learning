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
  private qdrantClient: QdrantClient | null = null;
  private readonly embeddings: OpenAIEmbeddings;
  private vectorStore: QdrantVectorStore | null = null;
  private readonly collectionName = 'chatbot_documents';
  private isInitialized = false;
  private readonly textSplitter: RecursiveCharacterTextSplitter;

  constructor(
    private configService: ConfigService,
    private openaiService: OpenAIService,
  ) {
    // Initialize embeddings (this doesn't require Qdrant)
    this.embeddings = new OpenAIEmbeddings(this.openaiService);

    // Initialize text splitter for chunking
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500, // Giảm kích thước chunk (tokens)
      chunkOverlap: 100, // Giảm overlap
      separators: ['\n\n', '\n', '* ', '. ', '! ', '? ', ' ', ''], // Thứ tự ưu tiên tách
    });

    // Try to initialize Qdrant, but don't throw if it fails
    this.initializeQdrant().catch((error) => {
      this.logger.warn(
        'Failed to initialize Qdrant, will use fallback mode:',
        error,
      );
    });
  }

  private async initializeQdrant() {
    try {
      const qdrantUrl = this.configService.get<string>(
        'QDRANT_URL',
        'http://localhost:6333',
      );
      const qdrantApiKey = this.configService.get<string>('QDRANT_API_KEY');

      const secureUrl = qdrantUrl.includes('localhost')
        ? qdrantUrl
        : qdrantUrl.replace('http://', 'https://');

      this.qdrantClient = new QdrantClient({
        url: secureUrl,
        apiKey: qdrantApiKey,
      });

      // Test connection
      await this.qdrantClient.getCollections();

      // Initialize vector store only if Qdrant is available
      this.vectorStore = new QdrantVectorStore(this.embeddings, {
        client: this.qdrantClient,
        collectionName: this.collectionName,
      });

      // Initialize collection
      await this.initializeCollection();

      this.isInitialized = true;
      this.logger.log('Qdrant initialized successfully');
    } catch (error) {
      this.logger.warn('Failed to initialize Qdrant:', error);
      this.qdrantClient = null;
      this.vectorStore = null;
      this.isInitialized = false;
    }
  }

  private async initializeCollection() {
    try {
      // Check if collection exists
      const collections = await this.qdrantClient?.getCollections();
      const exists = collections?.collections.some(
        (c) => c.name === this.collectionName,
      );

      if (!exists) {
        // Chỉ tạo mới nếu chưa có
        await this.qdrantClient?.createCollection(this.collectionName, {
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

  /**
   * Chuẩn hóa văn bản tiếng Việt cho tìm kiếm (giữ nguyên dấu)
   */
  private normalizeText(str: string): string {
    // Giữ nguyên dấu tiếng Việt, chỉ chuyển về lowercase
    const normalized = str.toLowerCase();
    // Chỉ loại bỏ các ký tự đặc biệt, giữ nguyên dấu cách và dấu tiếng Việt
    return normalized
      .replace(/[^a-zA-ZÀ-ỹ0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Chuẩn hóa văn bản tiếng Việt cho tìm kiếm (loại bỏ dấu)
   */
  private normalizeTextWithoutAccents(str: string): string {
    // Loại bỏ dấu tiếng Việt
    const withoutAccents = removeAccents(str.toLowerCase());
    // Chỉ loại bỏ các ký tự đặc biệt, giữ nguyên dấu cách
    return withoutAccents
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tách từ khóa từ văn bản đã chuẩn hóa (giữ nguyên dấu)
   */
  private extractKeywords(text: string): string[] {
    return this.normalizeText(text)
      .split(' ')
      .filter((word) => word.length > 0);
  }

  /**
   * Kiểm tra và khởi tạo lại Qdrant nếu cần thiết
   */
  private async checkAndReinitializeQdrant(): Promise<boolean> {
    if (this.isInitialized && this.qdrantClient) {
      try {
        // Test connection
        await this.qdrantClient.getCollections();
        return true;
      } catch (error) {
        this.logger.warn(
          'Qdrant connection lost, attempting to reinitialize...',
        );
        this.isInitialized = false;
        this.qdrantClient = null;
        this.vectorStore = null;
      }
    }

    // Try to reinitialize
    try {
      await this.initializeQdrant();
      return this.isInitialized;
    } catch (error) {
      this.logger.error('Failed to reinitialize Qdrant:', error);
      return false;
    }
  }

  /**
   * Phân đoạn văn bản thành các chunk nhỏ hơn
   */
  private async chunkDocuments(documents: string[]): Promise<string[]> {
    this.logger.log(`Bắt đầu phân đoạn ${documents.length} tài liệu...`);

    const allChunks: string[] = [];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      this.logger.debug(`Đang phân đoạn tài liệu ${i + 1}/${documents.length}`);

      try {
        // Tạo LangChain Document object
        const langchainDoc = new Document({
          pageContent: doc,
          metadata: { source: `document_${i}` },
        });

        // Phân đoạn văn bản
        const chunks = await this.textSplitter.splitDocuments([langchainDoc]);

        // Chuyển đổi chunks thành strings
        const chunkTexts = chunks.map((chunk) => chunk.pageContent);
        allChunks.push(...chunkTexts);

        this.logger.debug(
          `Tài liệu ${i + 1} được phân thành ${chunks.length} chunks`,
        );
      } catch (error) {
        this.logger.warn(`Lỗi khi phân đoạn tài liệu ${i + 1}:`, error);
        // Nếu không thể phân đoạn, giữ nguyên tài liệu gốc
        allChunks.push(doc);
      }
    }

    this.logger.log(
      `Hoàn thành phân đoạn: ${documents.length} tài liệu → ${allChunks.length} chunks`,
    );
    return allChunks;
  }

  async addDocuments(documents: string[]): Promise<void> {
    // Kiểm tra và khởi tạo lại Qdrant nếu cần
    const isAvailable = await this.checkAndReinitializeQdrant();
    if (!isAvailable) {
      throw new Error('Qdrant service is not available');
    }

    try {
      this.logger.log(`Bắt đầu thêm ${documents.length} tài liệu vào RAG`);

      // Bước 1: Phân đoạn văn bản thành chunks
      const chunkedDocuments = await this.chunkDocuments(documents);
      this.logger.log(`Sau khi phân đoạn: ${chunkedDocuments.length} chunks`);

      // Bước 2: Xử lý theo lô để tránh vượt quá giới hạn kích thước payload
      const batchSize = 50; // Giảm batch size vì có nhiều chunks hơn

      for (let i = 0; i < chunkedDocuments.length; i += batchSize) {
        const batch = chunkedDocuments.slice(i, i + batchSize);
        this.logger.log(
          `Đang xử lý lô ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunkedDocuments.length / batchSize)} (${batch.length} chunks)`,
        );

        const embeddings = await Promise.all(
          batch.map((doc) => this.openaiService.getEmbedding(doc)),
        );

        const points = batch.map((doc, j) => ({
          id: i + j, // Sử dụng chỉ số toàn cục làm ID
          vector: embeddings[j],
          payload: { text: doc },
        }));

        await this.qdrantClient!.upsert(this.collectionName, {
          points,
        });

        this.logger.log(
          `Đã thêm thành công lô ${Math.floor(i / batchSize) + 1}`,
        );
      }

      // Thêm document chào hỏi vào cuối
      const greetingDoc =
        'Xin chào! Tôi là trợ lý AI, rất vui được gặp bạn. Bạn có thể hỏi tôi về các khóa học, thông tin, hoặc bất kỳ điều gì khác. Tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể.';
      const greetingEmbedding =
        await this.openaiService.getEmbedding(greetingDoc);

      await this.qdrantClient!.upsert(this.collectionName, {
        points: [
          {
            id: chunkedDocuments.length, // Sử dụng ID sau tất cả chunks
            vector: greetingEmbedding,
            payload: { text: greetingDoc },
          },
        ],
      });

      this.logger.log(
        `Đã thêm thành công tất cả ${chunkedDocuments.length} chunks và lời chào`,
      );
    } catch (error) {
      this.logger.error('Error adding documents:', error);
      throw error;
    }
  }

  async keywordSearch(query: string): Promise<string[]> {
    // Kiểm tra và khởi tạo lại Qdrant nếu cần
    const isAvailable = await this.checkAndReinitializeQdrant();
    if (!isAvailable) {
      return [];
    }

    try {
      const result = await this.qdrantClient!.scroll(this.collectionName, {
        limit: 1000,
        with_payload: true,
        with_vector: false,
      });

      // Chuẩn hóa query
      const queryWords = this.extractKeywords(query);

      const matched = result.points
        .filter((point) => {
          if (!point.payload || typeof point.payload.text !== 'string')
            return false;
          const textNorm = this.normalizeText(point.payload.text);
          const isMatch = queryWords.every((word) => textNorm.includes(word));
          this.logger.debug(
            `[KeywordSearch] QueryWords: ${JSON.stringify(queryWords)} | TextNorm: "${textNorm}" | isMatch: ${isMatch}`,
          );
          return isMatch;
        })
        .map((point) =>
          point.payload && typeof point.payload.text === 'string'
            ? point.payload.text
            : '',
        )
        .filter(Boolean);

      this.logger.debug(`Keyword search found ${matched.length} results`);
      return matched;
    } catch (error) {
      this.logger.error('Error in keyword search:', error);
      return [];
    }
  }

  async generateResponse(query: string, context: string[]) {
    try {
      this.logger.debug('Context for prompt:', context);

      // Check if the query is related to courses
      const courseKeywords = [
        'khóa học',
        'học',
        'khoá học',
        'bài học',
        'course',
        'courses',
        'ghi danh',
        'tham gia',
        'đăng ký',
        'enroll',
        'enrollment',
        'register',
        'registration',
      ];
      const queryLower = query.toLowerCase();
      const isCourseQuery = courseKeywords.some((keyword) =>
        queryLower.includes(keyword),
      );

      // Extract URLs from context to use in the prompt
      const extractUrls = (text: string) => {
        const urlMatch = text.match(/URL: (https?:\/\/[^\s\n]+)/);
        return urlMatch ? urlMatch[1] : null;
      };

      // Only extract and use URLs if the query is about courses
      let urlInfo = '';
      if (isCourseQuery) {
        const contextUrls = context.map(extractUrls).filter(Boolean);
        if (contextUrls.length > 0) {
          // Chỉ thêm URL vào prompt mà không thêm hướng dẫn tham khảo
          urlInfo = `\n\nURL liên quan: ${contextUrls[0]}`;
        }
      }

      const prompt = `Bạn là trợ lý AI thân thiện. Hãy trả lời câu hỏi sau bằng tiếng Việt dựa trên ngữ cảnh bên dưới.
      - Ưu tiên sử dụng thông tin trong ngữ cảnh để trả lời.
      - Nếu ngữ cảnh không đủ thông tin, hãy nói rõ là không tìm thấy thông tin phù hợp.
      - Trả lời ngắn gọn, dễ hiểu.
      - TUYỆT ĐỐI KHÔNG thêm các cụm từ như "Bạn có thể tham khảo thêm", "Xem thêm", "Truy cập",... vào câu trả lời.
      - TUYỆT ĐỐI KHÔNG đính kèm link vào câu trả lời.
      - Hãy trả về kết quả dưới dạng HTML với inline CSS đẹp mắt, sử dụng màu sắc, in đậm, căn lề, block rõ ràng, chỉ dùng style trực tiếp trên thẻ HTML (không dùng class).
      - Chủ yếu sử dụng thẻ trình bày cho chữ, không dùng thẻ div, hạn chế dùng các thuộc tính CSS như padding, margin, tránh làm thay đổi layout tổng thể của khung chat.
      ${urlInfo}

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
    // Kiểm tra và khởi tạo lại Qdrant nếu cần
    const isAvailable = await this.checkAndReinitializeQdrant();
    if (!isAvailable) {
      this.logger.debug('Qdrant not available, returning fallback response');
      return {
        success: false,
        error: 'Qdrant service is not available',
        response:
          'Xin lỗi, tính năng tìm kiếm nâng cao hiện không khả dụng. Vui lòng thử lại sau.',
        searchResults: [],
      };
    }

    try {
      this.logger.debug(`[RAG] User question: "${query}"`);

      // Check if the query is related to courses
      const courseKeywords = [
        'khóa học',
        'học',
        'khoá học',
        'bài học',
        'course',
        'courses',
        'ghi danh',
        'tham gia',
        'đăng ký',
        'enroll',
        'enrollment',
        'register',
        'registration',
      ];
      const queryLower = query.toLowerCase();
      const isCourseQuery = courseKeywords.some((keyword) =>
        queryLower.includes(keyword),
      );

      // Chuẩn hóa câu hỏi và tách từ khóa
      const keywords = this.extractKeywords(query);
      this.logger.debug(`[RAG] Normalized keywords:`, keywords);

      // Lấy toàn bộ vector từ Qdrant
      const result = await this.qdrantClient!.scroll(this.collectionName, {
        limit: 1000,
        with_payload: true,
        with_vector: false,
      });

      // 1. Ưu tiên phrase match tuyệt đối
      const phrase = keywords.join(' ');
      const phraseMatchedVectors = result.points
        .map((point) => {
          if (!point.payload || typeof point.payload.text !== 'string')
            return null;
          const textNorm = this.normalizeText(point.payload.text);
          if (textNorm.includes(phrase)) {
            // Add bonus score for vectors with URL field only if course-related
            const hasUrl = point.payload.text.includes('URL: http');
            return {
              text: point.payload.text,
              score: hasUrl && isCourseQuery ? 110 : 100,
              phraseMatch: true,
            };
          }
          return null;
        })
        .filter(
          (
            item,
          ): item is { text: string; score: number; phraseMatch: boolean } =>
            item !== null,
        );

      if (phraseMatchedVectors.length > 0) {
        // Nếu có phrase match, sắp xếp và trả về
        const sortedVectors = phraseMatchedVectors.sort(
          (a, b) => b.score - a.score,
        );
        const context = sortedVectors.map((v) => v.text);
        this.logger.debug(`[RAG] Phrase match context:`, context);
        const response = await this.generateResponse(query, context);
        return { success: true, searchResults: context, response };
      }

      // 2. Nếu không có phrase match, so khớp từng từ như hiện tại
      const scoredVectors = result.points
        .map((point) => {
          if (!point.payload || typeof point.payload.text !== 'string')
            return null;
          const textNorm = this.normalizeText(point.payload.text);
          const matchedKeywords = keywords.filter((keyword) =>
            textNorm.includes(keyword),
          );
          let score = matchedKeywords.length;

          // Boost score for documents with URLs only if course-related
          const hasUrl = point.payload.text.includes('URL: http');
          if (hasUrl && isCourseQuery) score += 2;

          return score > 0
            ? {
                text: point.payload.text,
                score,
                matchedKeywords,
                phraseMatch: false,
              }
            : null;
        })
        .filter(
          (
            item,
          ): item is {
            text: string;
            score: number;
            matchedKeywords: string[];
            phraseMatch: boolean;
          } => item !== null,
        );

      if (scoredVectors.length > 0) {
        // Nếu có ít nhất 1 từ khớp, trả về top 10 kết quả, kèm cảnh báo nếu score thấp
        const topVectors = scoredVectors
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        const context = topVectors.map((v) => v.text);
        let response;
        if (topVectors[0].score === 1) {
          response = `Tôi tìm thấy một số thông tin liên quan, nhưng chưa chắc đã đúng ý bạn:\n${context.join('\n---\n')}`;
        } else {
          response = await this.generateResponse(query, context);
        }
        return { success: true, searchResults: context, response };
      }

      // 3. Nếu không có từ nào khớp, đề xuất các chủ đề gần nhất
      const allVectors = result.points
        .map((point) =>
          point.payload && typeof point.payload.text === 'string'
            ? point.payload.text
            : null,
        )
        .filter((text): text is string => !!text);

      const suggest = allVectors
        .slice(0, 3)
        .map((text, idx) => `${idx + 1}. ${text}`)
        .join('\n');
      const response = `Tôi không tìm thấy thông tin chính xác về "${query}". Bạn có muốn tham khảo các chủ đề sau?\n${suggest}`;

      return { success: true, searchResults: [], response };
    } catch (error) {
      this.logger.error('Error in testRag:', error);
      return {
        success: false,
        error: error.message,
        response: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn.',
        searchResults: [],
      };
    }
  }

  async listVectors() {
    // Kiểm tra và khởi tạo lại Qdrant nếu cần
    const isAvailable = await this.checkAndReinitializeQdrant();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Qdrant service is not available',
        total: 0,
        vectors: [],
      };
    }
    try {
      const result = await this.qdrantClient!.scroll(this.collectionName, {
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
    // Kiểm tra và khởi tạo lại Qdrant nếu cần
    const isAvailable = await this.checkAndReinitializeQdrant();
    if (!isAvailable) {
      throw new Error('Qdrant service is not available');
    }
    await this.qdrantClient!.deleteCollection(this.collectionName);
    await this.qdrantClient!.createCollection(this.collectionName, {
      vectors: {
        size: 1536,
        distance: 'Cosine',
      },
    });
  }

  /**
   * Test chức năng phân đoạn văn bản
   */
  async testChunking(text: string): Promise<{
    originalLength: number;
    chunks: string[];
    chunkCount: number;
    averageChunkLength: number;
  }> {
    try {
      this.logger.log('Testing chunking functionality...');

      const originalLength = text.length;
      const chunkedDocuments = await this.chunkDocuments([text]);

      const averageChunkLength =
        chunkedDocuments.length > 0
          ? Math.round(
              chunkedDocuments.reduce((sum, chunk) => sum + chunk.length, 0) /
                chunkedDocuments.length,
            )
          : 0;

      return {
        originalLength,
        chunks: chunkedDocuments,
        chunkCount: chunkedDocuments.length,
        averageChunkLength,
      };
    } catch (error) {
      this.logger.error('Error testing chunking:', error);
      throw error;
    }
  }

  /**
   * Lấy trạng thái hiện tại của Qdrant
   */
  async getQdrantStatus(): Promise<{
    isInitialized: boolean;
    isConnected: boolean;
    collectionExists: boolean;
    collectionName: string;
    error?: string;
  }> {
    try {
      const isAvailable = await this.checkAndReinitializeQdrant();

      if (!isAvailable) {
        return {
          isInitialized: false,
          isConnected: false,
          collectionExists: false,
          collectionName: this.collectionName,
          error: 'Qdrant service is not available',
        };
      }

      // Kiểm tra collection có tồn tại không
      const collections = await this.qdrantClient!.getCollections();
      const collectionExists = collections.collections.some(
        (c) => c.name === this.collectionName,
      );

      return {
        isInitialized: this.isInitialized,
        isConnected: true,
        collectionExists,
        collectionName: this.collectionName,
      };
    } catch (error) {
      return {
        isInitialized: this.isInitialized,
        isConnected: false,
        collectionExists: false,
        collectionName: this.collectionName,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
