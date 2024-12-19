import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { MessageService } from "./message.service";
import { Message } from "../interfaces/message.interface";
import { TelegramClient } from "telegram";
import { ConfigService } from "@nestjs/config";
import { ClientService } from "./client.service";
import { RequestQueue } from "@/queue";

interface AIServiceRequest {
  prompt: string;
  chatId: string;
}

interface AIServiceResponse {
  data: string;
}
@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);
  private nextResponseTime: number = 0;
  private queue = new RequestQueue();
  private readonly minDelayMinutes: number;
  private readonly maxDelayMinutes: number;
  private readonly apiUrl: string;

  constructor(
    private readonly groupId: string,
    private readonly clientService: ClientService,
    private readonly messageService: MessageService,
    minDelayMinutes: number = 1,
    maxDelayMinutes: number = 5,
    private readonly configService: ConfigService
  ) {
    this.validateDelayTimes(minDelayMinutes, maxDelayMinutes);
    this.minDelayMinutes = minDelayMinutes;
    this.maxDelayMinutes = maxDelayMinutes;
    this.apiUrl = this.configService.get("aiReplyAssistant.apiUrl") || "";
  }

  private validateDelayTimes(min: number, max: number): void {
    if (min < 0) {
      throw new Error("Minimum delay cannot be negative");
    }
    if (max < min) {
      throw new Error("Maximum delay must be greater than minimum delay");
    }
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error("Delay times must be integers");
    }
  }

  async handleMessage(
    message: Message,
    client: TelegramClient,
    replyToMessageId: number
  ): Promise<void> {
    await this.queue.add(async () => {
      const currentTime = Date.now();

      if (!this.shouldRespond(currentTime)) {
        return;
      }

      try {
        const response = await this.getAIResponse(
          this.clientService.characterId ||
            "d089d51f-e1fa-4ae1-b85a-1e00fe8bc295",
          message.text,
          this.groupId
        );

        await this.messageService.sendMessage(
          client,
          this.groupId,
          response,
          Math.random() > 0.5 ? replyToMessageId : undefined
        );

        this.updateNextResponseTime();

        this.logger.log(
          `Response sent for group ${this.groupId}. Next response scheduled for: ${new Date(
            this.nextResponseTime
          )}`
        );
      } catch (error) {
        this.logger.error(
          `Failed to handle message for group ${this.groupId}:`,
          error
        );
        throw error;
      }
    });
  }

  async handleMessageConversation(
    messages: { user: string; content: string }[],
    client: TelegramClient,
    replyToMessageId: number
  ): Promise<void> {
    await this.queue.add(async () => {
      const currentTime = Date.now();

      if (!this.shouldRespond(currentTime)) {
        return;
      }

      try {
        const response = await this.getAIResponseConversation(
          this.clientService.characterId ||
            "d089d51f-e1fa-4ae1-b85a-1e00fe8bc295",
          messages
        );

        await this.messageService.sendMessage(
          client,
          this.groupId,
          response,
          Math.random() > 0.5 ? replyToMessageId : undefined
        );

        this.updateNextResponseTime();

        this.logger.log(
          `Response sent for group ${this.groupId}. Next response scheduled for: ${new Date(
            this.nextResponseTime
          )}`
        );
      } catch (error) {
        this.updateNextResponseTime();
        this.logger.error(
          `Failed to handle message for group ${this.groupId}:`,
          error
        );
        throw error;
      }
    });
  }

  private shouldRespond(currentTime: number): boolean {
    if (!this.nextResponseTime) {
      this.updateNextResponseTime();
      return false;
    }

    return currentTime >= this.nextResponseTime;
  }

  private updateNextResponseTime(): void {
    const delayMinutes = this.getRandomDelay();
    this.nextResponseTime = Date.now() + delayMinutes * 60 * 1000;
  }

  private getRandomDelay(): number {
    return Math.floor(
      Math.random() * (this.maxDelayMinutes - this.minDelayMinutes + 1) +
        this.minDelayMinutes
    );
  }

  //   curl -X 'POST' \
  //   'https://ai-reply-assistant-api.roadto1m.xyz/characters/d089d51f-e1fa-4ae1-b85a-1e00fe8bc295/chat' \
  //   -H 'accept: */*' \
  //   -H 'Content-Type: application/json' \
  //   -d '{
  //   "prompt": "Chào chú",
  //   "chatId": "chat-123"
  //   }'
  private async getAIResponse(
    characterId: string,
    message: string,
    chatId: string
  ): Promise<string> {
    try {
      if (!characterId) {
        throw new Error("Character ID is required");
      }

      const requestData: AIServiceRequest = {
        prompt: message,
        chatId,
      };

      const response = await axios.post<AIServiceResponse>(
        `${this.apiUrl}/characters/${characterId}/chat`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (!response.data) {
        throw new Error("Invalid response format from AI service");
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Failed to get AI response: ${error.message}`,
          error.response?.data
        );
        throw new Error(
          `AI service error: ${
            error.response?.status
              ? `${error.response.status} - ${error.message}`
              : "Network error"
          }`
        );
      }

      this.logger.error("Failed to get AI response:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  // curl -X 'POST' \
  // 'https://ai-reply-assistant-api.roadto1m.xyz/characters/first_agent/chat/conversation' \
  // -H 'accept: */*' \
  // -H 'Content-Type: application/json' \
  // -d '{
  // "messages": [
  //   {
  //     "user": "Đạt",
  //     "content": "Hôm nay có kèo gì ngon không em zai?"
  //   },
  //   {
  //     "user": "Nguyên",
  //     "content": "Méo biết, có mấy con meme mới launch trên solana thôi"
  //   },
  //   {
  //     "user": "Quân",
  //     "content": "Ừm, tôi cũng thấy có mấy con ngon phết"
  //   }
  //   ]
  // }'
  async getAIResponseConversation(
    characterId: string,
    messages: { user: string; content: string }[]
  ): Promise<string> {
    try {
      const response = await axios.post<AIServiceResponse>(
        `${this.apiUrl}/characters/${characterId}/chat/conversation`,
        { messages },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (!response.data) {
        throw new Error("Invalid response format from AI service");
      }

      return response.data.data;
    } catch (error) {
      this.logger.error("Failed to get AI response:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  getNextResponseTime(): Date | null {
    return this.nextResponseTime ? new Date(this.nextResponseTime) : null;
  }

  getDelayConfig(): { min: number; max: number } {
    return {
      min: this.minDelayMinutes,
      max: this.maxDelayMinutes,
    };
  }
}
