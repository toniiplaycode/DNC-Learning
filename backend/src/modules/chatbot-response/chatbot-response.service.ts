import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotResponse } from '../../entities/ChatbotResponse';
import { Message } from '../../entities/Message';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly CONFIDENCE_THRESHOLD = 0.5; // Lowered threshold for better matching
  private readonly CHATBOT_USER_ID = -1; // Special ID for chatbot

  constructor(
    @InjectRepository(ChatbotResponse)
    private chatbotResponseRepo: Repository<ChatbotResponse>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async processMessage(message: Message): Promise<Message | null> {
    this.logger.debug(`Processing message: "${message.messageText}"`);

    // Don't respond to chatbot messages
    if (message.senderId === this.CHATBOT_USER_ID) {
      return null;
    }

    const response = await this.findBestResponse(message.messageText);
    this.logger.debug('Found response:', response);

    if (!response) {
      return this.createBotMessage(
        message.senderId,
        'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử câu hỏi khác.',
      );
    }

    return this.createBotMessage(message.senderId, response.response);
  }

  private async findBestResponse(
    messageText: string,
  ): Promise<ChatbotResponse | null> {
    this.logger.debug(`Finding best response for: "${messageText}"`);

    const allResponses = await this.chatbotResponseRepo.find();
    this.logger.debug(`Found ${allResponses.length} possible responses`);

    let bestMatch: ChatbotResponse | null = null;
    let highestConfidence = 0;

    const messageLower = messageText.toLowerCase().trim();

    for (const response of allResponses) {
      try {
        // Parse keywords properly with type checking
        let keywords: string[];
        if (Array.isArray(response.keywords)) {
          keywords = response.keywords;
        } else if (typeof response.keywords === 'string') {
          // Handle string array format from database
          try {
            keywords = JSON.parse(response.keywords as string);
          } catch {
            // If JSON.parse fails, try splitting by comma
            keywords = (response.keywords as string)
              .replace(/[[\]"']/g, '') // Remove brackets and quotes
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

        this.logger.debug(`Processing response ${response.id}:`, {
          category: response.category,
          keywords,
        });

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

            if (confidence > highestConfidence) {
              highestConfidence = confidence;
              bestMatch = response;
              this.logger.debug(`New best match: ${response.category}`);
            }
            break;
          }
        }
      } catch (error) {
        this.logger.error(`Error processing response ${response.id}:`, error);
        continue;
      }
    }

    if (bestMatch) {
      this.logger.debug(`Selected response:`, {
        category: bestMatch.category,
        confidence: highestConfidence,
        response: bestMatch.response,
      });
    } else {
      this.logger.debug('No matching response found');
    }

    return bestMatch;
  }

  private async createBotMessage(
    receiverId: number,
    text: string,
  ): Promise<Message> {
    const botMessage = this.messageRepo.create({
      senderId: this.CHATBOT_USER_ID,
      receiverId: receiverId,
      messageText: text,
      isRead: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.messageRepo.save(botMessage);
  }
}
