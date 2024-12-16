import { Inject, Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { MessageService } from "./message.service";
import { Message } from "../interfaces/message.interface";
import { TelegramClient } from "telegram";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);
  private nextResponseTimes: Map<string, number> = new Map();
  private readonly minDelayMinutes: number;
  private readonly maxDelayMinutes: number;
  private readonly apiUrl: string;

  constructor(
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

    if (!this.shouldRespond(currentTime, groupId)) {
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

      this.updateNextResponseTime(groupId);

      this.logger.log(
        `Response sent for group ${groupId}. Next response scheduled for: ${new Date(this.nextResponseTimes.get(groupId)!)}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle message for group ${groupId}:`,
        error
      );
      throw error;
    }
  }

  private shouldRespond(currentTime: number, groupId: string): boolean {
    if (!this.nextResponseTimes.has(groupId)) {
      this.updateNextResponseTime(groupId);
      return true;
    }

    return currentTime >= this.nextResponseTimes.get(groupId)!;
  }

  private updateNextResponseTime(groupId: string): void {
    const delayMinutes = this.getRandomDelay();
    this.nextResponseTimes.set(groupId, Date.now() + delayMinutes * 60 * 1000);
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

  getNextResponseTime(groupId: string): Date | null {
    const nextTime = this.nextResponseTimes.get(groupId);
    return nextTime ? new Date(nextTime) : null;
  }

  getDelayConfig(): { min: number; max: number } {
    return {
      min: this.minDelayMinutes,
      max: this.maxDelayMinutes,
    };
  }
}
