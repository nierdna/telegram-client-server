import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { MessageService } from "./message.service";
import { Message } from "../interfaces/message.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ResponseService {
  private readonly aiReplyAssistantUrl: string;
  private readonly logger = new Logger(ResponseService.name);
  private nextResponseTime: number | null = null;
  private readonly MIN_DELAY_MINUTES = Number(
    process.env.MIN_DELAY_MINUTES || 60
  );
  private readonly MAX_DELAY_MINUTES = Number(
    process.env.MAX_DELAY_MINUTES || 90
  );

  constructor(
    private readonly messageService: MessageService,
    private readonly configService: ConfigService
  ) {
    this.aiReplyAssistantUrl = this.configService.get<string>(
      "ai-reply-assistant.url"
    ) as string;
  }

  async handleMessage(
    message: Message,
    client: any,
    groupId: string
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
        Math.random() > 0.5 ? message.id : undefined
      );

      // Set next response time
      this.updateNextResponseTime();

      this.logger.log(
        `Response sent. Next response scheduled for: ${new Date(this.nextResponseTime!)}`
      );
    } catch (error) {
      this.logger.error("Failed to handle message:", error);
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
      Math.random() * (this.MAX_DELAY_MINUTES - this.MIN_DELAY_MINUTES + 1) +
        this.MIN_DELAY_MINUTES
    );
  }

  private async getAIResponse(message: string): Promise<string> {
    try {
      const response = await axios.post(
        this.aiReplyAssistantUrl + "/api/chat",
        { message },
        { headers: { "Content-Type": "application/json" } }
      );

      return (
        response.data.response || "Sorry, I could not generate a response."
      );
    } catch (error) {
      this.logger.error("Failed to get AI response:", error);
      throw error;
    }
  }
}
