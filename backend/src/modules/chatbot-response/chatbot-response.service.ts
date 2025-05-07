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

  constructor(
    @InjectRepository(ChatbotResponse)
    private chatbotResponseRepo: Repository<ChatbotResponse>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    private ragService: RagService,
  ) {}

  async processMessage(message: Message): Promise<Message | null> {
    this.logger.debug(`Processing message: "${message.messageText}"`);

    // Don't respond to chatbot messages
    if (message.senderId === this.CHATBOT_USER_ID) {
      return null;
    }

    try {
      // Sử dụng pipeline keyword search mới
      const ragResult = await this.ragService.testRag(message.messageText);
      const response = ragResult.response;

      if (!response) {
        throw new Error('Failed to generate response');
      }

      return this.createBotMessage(message.senderId, response);
    } catch (error) {
      this.logger.error('Error processing message with RAG:', error);

      // Fallback to traditional response if RAG fails
      const fallbackResponse = await this.findBestResponse(message.messageText);
      if (!fallbackResponse) {
        return this.createBotMessage(
          message.senderId,
          'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử câu hỏi khác.',
        );
      }

      return this.createBotMessage(message.senderId, fallbackResponse.response);
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
  ): Promise<Message> {
    const html = this.textToHtml(text);
    const botMessage = this.messageRepo.create({
      senderId: this.CHATBOT_USER_ID,
      receiverId: receiverId,
      messageText: html,
      isRead: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.messageRepo.save(botMessage);
  }
}
