import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { EventService } from './event.service';
import { ResponseService } from './response.service';
import { ReactionService } from './reaction.service';
import { MessageService } from './message.service';

@Injectable()
export class ClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ClientService.name);
  private client: TelegramClient | null = null;
  private isInitialized = false;
  eventService: EventService;
  private responseService: ResponseService;
  private reactionService: ReactionService;

  constructor(
    private readonly apiId: number,
    private readonly apiHash: string,
    private readonly stringSession: string,
    private readonly groupIds: string[],
    private readonly messageService: MessageService,
    private readonly minReplyDelay: number,
    private readonly maxReplyDelay: number,
    private readonly minReactionDelay: number,
    private readonly maxReactionDelay: number,
  ) {
    // Initialize services with configured delays
    this.responseService = new ResponseService(
      this.messageService,
      this.minReplyDelay,
      this.maxReplyDelay
    );

    this.reactionService = new ReactionService(
      this.minReactionDelay,
      this.maxReactionDelay
    );

    // Initialize EventService with required dependencies
    this.eventService = new EventService(
      this,
      this.responseService,
      this.reactionService
    );
  }

  async onModuleInit() {
    if (this.isInitialized) {
      this.logger.warn('Client service already initialized');
      return;
    }

    try {
      this.client = await this.createClient();
      this.isInitialized = true;
      
      // Set up event handlers after client is initialized
      await this.eventService.setupEventHandlers();
      
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

  private async createClient(): Promise<TelegramClient> {
    try {
      const session = new StringSession(this.stringSession);
      const client = new TelegramClient(session, this.apiId, this.apiHash, {
        connectionRetries: 5
      });

      await client.connect();
      return client;
    } catch (error) {
      this.logger.error('Failed to create Telegram client:', error);
      throw error;
    }
  }

  getClient(): TelegramClient {
    if (!this.client || !this.isInitialized) {
      throw new Error('Telegram client not initialized');
    }
    return this.client;
  }

  getGroupIds(): string[] {
    return this.groupIds;
  }

  getEventService(): EventService {
    return this.eventService;
  }
}