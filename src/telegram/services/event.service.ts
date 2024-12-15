import { Injectable, Logger } from '@nestjs/common';
import { NewMessage } from 'telegram/events';
import { TelegramEvent } from '../interfaces/telegram-event.interface';
import { ClientService } from './client.service';
import { MessageHandler } from '../handlers/message.handler';
import { ResponseService } from "./response.service";

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private messageHandler: MessageHandler;
  private isSetup = false;

  constructor(
    private readonly clientService: ClientService,
    private readonly responseService: ResponseService
  ) {
    this.messageHandler = new MessageHandler(this.clientService.getGroupId());
  }

  async setupEventHandlers() {
    if (this.isSetup) {
      this.logger.warn("Event handlers already set up");
      return;
    }

    try {
      const client = this.clientService.getClient();
      if (!client) {
        throw new Error("Telegram client not initialized");
      }

      client.addEventHandler(
        async (event) => {
          const telegramEvent =
            await this.messageHandler.handleNewMessage(event);
          if (telegramEvent) {
            await this.processNewMessage(telegramEvent);
          }
        },
        new NewMessage({
          chats: [this.clientService.getGroupId()],
        })
      );

      this.isSetup = true;
      this.logger.log("Event handlers set up successfully");
    } catch (error) {
      this.logger.error("Failed to set up event handlers:", error);
      throw error;
    }
  }

  private async processNewMessage(event: TelegramEvent) {
    this.logger.log(`New message in group: ${event.message?.text}`);

    if (event.message) {
      await this.responseService.handleMessage(
        event.message,
        this.clientService.getClient(),
        this.clientService.getGroupId()
      );
    }
  }
}