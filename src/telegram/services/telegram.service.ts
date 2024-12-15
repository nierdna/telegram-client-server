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
    private readonly eventService: EventService,
    private readonly messageService: MessageService,
  ) {}

  async onModuleInit() {
    try {
      // Wait for client service to initialize first
      await this.clientService.onModuleInit();
      
      // Only set up event handlers after client is ready
      await this.eventService.setupEventHandlers();
      
      this.isInitialized = true;

      // await this.sendMessage('Hello, world!');
      
      this.logger.log('Telegram service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Telegram service:', error);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Telegram service not initialized');
    }

    await this.messageService.sendMessage(
      this.clientService.getClient(),
      this.clientService.getGroupId(),
      message
    );
  }

  async getRecentMessages(limit: number = 100) {
    if (!this.isInitialized) {
      throw new Error('Telegram service not initialized');
    }

    return this.messageService.getMessages(
      this.clientService.getClient(),
      this.clientService.getGroupId(),
      limit
    );
  }
}