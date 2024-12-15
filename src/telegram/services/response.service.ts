import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { MessageService } from './message.service';
import { Message } from '../interfaces/message.interface';
import { TelegramClient } from 'telegram';

@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);
  private nextResponseTime: number | null = null;
  private readonly minDelayMinutes: number;
  private readonly maxDelayMinutes: number;
  private readonly API_URL =
    "https://bolt-ai-reply-assistan-server.vercel.app/api/chat";

  constructor(
    private readonly messageService: MessageService,
    minDelayMinutes: number = 1,
    maxDelayMinutes: number = 5
  ) {
    this.validateDelayTimes(minDelayMinutes, maxDelayMinutes);
    this.minDelayMinutes = minDelayMinutes;
    this.maxDelayMinutes = maxDelayMinutes;
  }

  private validateDelayTimes(min: number, max: number): void {
    if (min < 0) {
      throw new Error("Minimum delay cannot be negative");
    }
    if (max <= min) {
      throw new Error("Maximum delay must be greater than minimum delay");
    }
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error("Delay times must be integers");
    }
  }

  async handleMessage(
    message: Message,
    client: TelegramClient,
    groupId: string,
    replyToMessageId: number
  ): Promise<void> {
    const currentTime = Date.now();

    if (!this.shouldRespond(currentTime)) {
      return;
    }

    try {
      const response = await this.getAIResponse(message.text);
      await this.messageService.sendMessage(
        client,
        groupId,
        response,
        Math.random() > 0.5 ? replyToMessageId : undefined // random reply to message
      );

      this.updateNextResponseTime();

      this.logger.log(
        `Response sent. Next response scheduled for: ${new Date(this.nextResponseTime!)}`
      );
    } catch (error) {
      this.logger.error("Failed to handle message:", error);
      throw error;
    }
  }

  private shouldRespond(currentTime: number): boolean {
    if (!this.nextResponseTime) {
      this.updateNextResponseTime();
      return true;
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

  private async getAIResponse(message: string): Promise<string> {
    try {
      const response = await axios.post(
        this.API_URL,
        { message },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000, // 10 second timeout
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response format from AI service");
      }

      return response.data.response;
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