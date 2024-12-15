import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramClient } from 'telegram';
import { TelegramConfig } from '../interfaces/telegram-config.interface';
import { createTelegramClient } from '../utils/client.util';

@Injectable()
export class ClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ClientService.name);
  private client: TelegramClient | null = null;
  private readonly config: TelegramConfig;
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiId: this.configService.get<number>('telegram.apiId') as number,
      apiHash: this.configService.get<string>('telegram.apiHash') as string,
      stringSession: this.configService.get<string>('telegram.stringSession') as string,
      groupId: this.configService.get<string>('telegram.groupId') as string,
    };
  }

  async onModuleInit() {
    if (this.isInitialized) {
      this.logger.warn('Client service already initialized');
      return;
    }

    try {
      this.client = await createTelegramClient(this.config);
      this.isInitialized = true;
      this.logger.log('Telegram client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Telegram client:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.disconnect();
        this.client = null;
        this.isInitialized = false;
        this.logger.log('Telegram client disconnected');
      } catch (error) {
        this.logger.error('Error disconnecting Telegram client:', error);
        throw error;
      }
    }
  }

  getClient(): TelegramClient {
    if (!this.client || !this.isInitialized) {
      throw new Error('Telegram client not initialized');
    }
    return this.client;
  }

  getGroupId(): string {
    return this.config.groupId;
  }
}