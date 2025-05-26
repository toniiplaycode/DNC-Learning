import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotResponse } from '../../entities/ChatbotResponse';
import { Message } from '../../entities/Message';
import { RagService } from '../rag/rag.service';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly CHATBOT_USER_ID = -1; // Special ID for chatbot
  private isRagAvailable: boolean = true; // Add this flag

  constructor(
    @InjectRepository(ChatbotResponse)
    private chatbotResponseRepo: Repository<ChatbotResponse>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    private ragService: RagService,
  ) {
    // Check RAG availability on startup
    this.checkRagAvailability();
  }

  private async checkRagAvailability() {
    try {
      // Try to initialize RAG service
      await this.ragService.testRag('test');
      this.isRagAvailable = true;
      this.logger.log('RAG service is available');
    } catch (error) {
      this.isRagAvailable = false;
      this.logger.warn(
        'RAG service is not available, falling back to traditional responses',
      );
    }
  }

  async processMessage(message: Message): Promise<Message | null> {
    this.logger.debug(`Processing message: "${message.messageText}"`);

    // Don't respond to chatbot messages
    if (message.senderId === this.CHATBOT_USER_ID) {
      return null;
    }

    try {
      // Try RAG first
      const ragResult = await this.ragService.testRag(message.messageText);

      // If RAG is available and successful
      if (ragResult.success) {
        const response = ragResult.response;

        // Check if the query is related to courses
        const courseKeywords = [
          'khóa học',
          'khoá học',
          'bài học',
          'course',
          'courses',
        ];
        const queryLower = message.messageText.toLowerCase();
        const isCourseQuery = courseKeywords.some((keyword) =>
          queryLower.includes(keyword),
        );

        // Enhanced URL extraction from RAG results
        let referenceLink: string | undefined = undefined;

        // Only extract and use referenceLink if the query is about courses
        if (
          isCourseQuery &&
          ragResult.searchResults &&
          ragResult.searchResults.length > 0
        ) {
          // First try to find URL line in the context
          for (const result of ragResult.searchResults) {
            // Look for URL field
            const urlLineMatch = result.match(/URL: (https?:\/\/[^\s\n]+)/);
            if (urlLineMatch && urlLineMatch[1]) {
              referenceLink = urlLineMatch[1];
              this.logger.debug(`Found URL from field: ${referenceLink}`);
              break;
            }

            // Standard URL regex fallback
            const urlRegex = /(https?:\/\/[^\s\n]+)/g;
            const matches = result.match(urlRegex);
            if (matches && matches.length > 0) {
              // Use the first URL found as reference
              referenceLink = matches[0];
              this.logger.debug(`Found URL from regex: ${referenceLink}`);
              break;
            }
          }
        }

        if (!response) {
          throw new Error('Failed to generate response');
        }

        return this.createBotMessage(message.senderId, response, referenceLink);
      }

      // If RAG is not available or failed, use traditional response
      this.logger.debug('Falling back to traditional response');
      const fallbackResponse = await this.findBestResponse(message.messageText);

      if (!fallbackResponse) {
        return this.createBotMessage(
          message.senderId,
          'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử câu hỏi khác.',
        );
      }

      // Determine if the query is course-related
      const courseKeywords = [
        'khóa học',
        'học',
        'khoá học',
        'bài học',
        'course',
        'courses',
      ];
      const queryLower = message.messageText.toLowerCase();
      const isCourseQuery = courseKeywords.some((keyword) =>
        queryLower.includes(keyword),
      );

      // Only use referenceUrl if the query is about courses
      const referenceUrl = isCourseQuery
        ? (fallbackResponse['referenceUrl'] as string | undefined)
        : undefined;

      return this.createBotMessage(
        message.senderId,
        fallbackResponse.response,
        referenceUrl,
      );
    } catch (error) {
      this.logger.error('Error in processMessage:', error);
      return this.createBotMessage(
        message.senderId,
        'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
      );
    }
  }

  private async findBestResponse(
    messageText: string,
  ): Promise<ChatbotResponse | null> {
    this.logger.debug(`Finding best response for: "${messageText}"`);

    // Get all responses, ordered by newest first
    const allResponses = await this.chatbotResponseRepo.find({
      order: {
        id: 'DESC', // Newest responses first
      },
    });

    this.logger.debug(`Found ${allResponses.length} possible responses`);

    let bestMatches: Array<{
      response: ChatbotResponse;
      confidence: number;
    }> = [];

    const messageLower = messageText.toLowerCase().trim();

    for (const response of allResponses) {
      try {
        // Parse keywords properly with type checking
        let keywords: string[];
        if (Array.isArray(response.keywords)) {
          keywords = response.keywords;
        } else if (typeof response.keywords === 'string') {
          try {
            keywords = JSON.parse(response.keywords as string);
          } catch {
            keywords = (response.keywords as string)
              .replace(/[[\]"']/g, '')
              .split(',')
              .map((k) => k.trim())
              .filter((k) => k.length > 0);
          }
        } else {
          this.logger.warn(
            `Invalid keywords format for response ${response.id}`,
          );
          continue;
        }

        // Check each keyword
        for (const keyword of keywords) {
          const keywordLower = keyword.toLowerCase().trim();
          if (
            messageLower === keywordLower ||
            messageLower.includes(keywordLower)
          ) {
            const confidence = response.confidence || 1.0;
            this.logger.debug(
              `Match found for "${keywordLower}" with confidence ${confidence}`,
            );

            bestMatches.push({
              response: response,
              confidence: confidence,
            });
            break; // Found a match for this response, move to next
          }
        }
      } catch (error) {
        this.logger.error(`Error processing response ${response.id}:`, error);
        continue;
      }
    }

    // Sort matches by confidence and creation date (using ID as proxy for creation date)
    bestMatches.sort((a, b) => {
      if (a.confidence === b.confidence) {
        // If same confidence, prefer newer response (higher ID)
        return b.response.id - a.response.id;
      }
      return b.confidence - a.confidence;
    });

    const bestMatch = bestMatches[0]?.response || null;

    if (bestMatch) {
      this.logger.debug(`Selected response:`, {
        id: bestMatch.id,
        category: bestMatch.category,
        confidence: bestMatch.confidence,
        response: bestMatch.response,
      });
    } else {
      this.logger.debug('No matching response found');
    }

    return bestMatch;
  }

  private textToHtml(text: string): string {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    let html = '';
    let inList = false;
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        if (!inList) {
          html += '<ol>';
          inList = true;
        }
        html += `<li>${match[1]}</li>`;
      } else {
        if (inList) {
          html += '</ol>';
          inList = false;
        }
        html += `<p>${line}</p>`;
      }
    }
    if (inList) html += '</ol>';
    return html;
  }

  private async createBotMessage(
    receiverId: number,
    text: string,
    referenceLink?: string,
  ): Promise<Message> {
    let messageText = text;

    // If referenceLink exists, remove it from messageText
    if (referenceLink && referenceLink.trim()) {
      // Remove URL from messageText if it exists
      messageText = messageText
        .replace(new RegExp(referenceLink, 'g'), '')
        .trim();

      // Remove markdown link format if it exists
      messageText = messageText
        .replace(new RegExp(`\\[([^\\]]+)\\]\\(${referenceLink}\\)`, 'g'), '$1')
        .trim();

      // Remove any remaining URL references
      messageText = messageText.replace(/URL:?\s*/i, '').trim();
      messageText = messageText.replace(/tại\s+/i, '').trim();
      messageText = messageText.replace(/truy cập\s+/i, '').trim();

      // Remove any trailing punctuation that might be left
      messageText = messageText.replace(/[.,;:]+\s*$/, '').trim();
    }

    const html = this.textToHtml(messageText);

    // Only include referenceLink if it's defined and not empty
    const botMessage = this.messageRepo.create({
      senderId: this.CHATBOT_USER_ID,
      receiverId: receiverId,
      messageText: html,
      referenceLink:
        referenceLink && referenceLink.trim() ? referenceLink : undefined,
      isRead: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.messageRepo.save(botMessage);
  }
}
