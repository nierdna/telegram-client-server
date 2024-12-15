import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientService } from './client.service';
import { EventService } from './event.service';
import { MessageService } from './message.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private isInitialized = false;

  constructor(
    private readonly clientService: ClientService,
    private readonly eventService: EventService
  ) {}

  async onModuleInit() {
    try {
      // Wait for client service to initialize first
      await this.clientService.onModuleInit();

      // Only set up event handlers after client is ready
      await this.eventService.setupEventHandlers();

      this.isInitialized = true;
      this.logger.log("Telegram service initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Telegram service:", error);
      throw error;
    }
  }
}