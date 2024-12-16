import { Injectable, Logger } from "@nestjs/common";
import { NewMessage, NewMessageEvent } from "telegram/events";
import { TelegramEvent } from "../interfaces/telegram-event.interface";
import { MessageHandler } from "../handlers/message.handler";
import { ClientService } from "./client.service";

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private messageHandler: MessageHandler | null = null;
  private isSetup = false;

  constructor(private readonly clientService: ClientService) {}

  async setupEventHandlers() {
    if (this.isSetup) {
      this.logger.warn("Event handlers already set up");
      return;
    }

    try {
      const groupIds = this.clientService.getGroupIds();
      this.messageHandler = new MessageHandler(groupIds);

      const client = this.clientService.getClient();

      // Set up event handler for new messages
      client.addEventHandler(async (event) => {
        await this.handleEvent(event);
      }, new NewMessage(this.messageHandler.getNewMessageOptions()));

      this.isSetup = true;
      this.logger.log("Event handlers set up successfully");
    } catch (error) {
      this.logger.error("Failed to set up event handlers:", error);
      throw error;
    }
  }

  private async handleEvent(event: NewMessageEvent) {
    try {
      if (!this.messageHandler) {
        throw new Error("Message handler not initialized");
      }

      const telegramEvent = await this.messageHandler.handleNewMessage(event);
      if (telegramEvent) {
        await this.processNewMessage(telegramEvent);
      }
    } catch (error) {
      this.logger.error("Error handling event:", error);
    }
  }

  private async processNewMessage(event: TelegramEvent) {
    if (!event.message) {
      return;
    }

    const client = this.clientService.getClient();
    const groupId = event.message.fromId;

    this.logger.log(
      `Processing message in group ${groupId}: ${event.message.text}`
    );

    const groupService = this.clientService.getGroupServices().get(groupId);

    if (!groupService) {
      this.logger.error(`Group service not found for group ${groupId}`);
      return;
    }

    try {
      await groupService.handleResponse(event.message);
      await groupService.handleReaction(event.message);
    } catch (error) {
      this.logger.error("Error processing message:", error);
    }
  }
}