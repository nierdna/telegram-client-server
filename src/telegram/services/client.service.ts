import { Injectable, Logger } from "@nestjs/common";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { EventService } from "./event.service";
import { MessageService } from "./message.service";
import { ConfigService } from "@nestjs/config";
import { GroupService } from "./group.service";

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);
  private client: TelegramClient | null = null;
  private isInitialized = false;
  eventService: EventService;
  private groupServices: Map<string, GroupService> = new Map();

  constructor(
    private readonly apiId: number,
    private readonly apiHash: string,
    private readonly stringSession: string,
    private readonly groupIds: string[],
    private readonly messageService: MessageService,
    readonly minReplyDelay: number,
    readonly maxReplyDelay: number,
    readonly minReactionDelay: number,
    readonly maxReactionDelay: number,
    private readonly configService: ConfigService,
    readonly characterId: string
  ) {
    // Initialize EventService with required dependencies
    this.eventService = new EventService(this);

    this.groupIds.forEach((groupId) => {
      this.groupServices.set(
        groupId,
        new GroupService(groupId, this, this.messageService, this.configService)
      );
    });
  }

  async onModuleInit() {
    if (this.isInitialized) {
      this.logger.warn("Client service already initialized");
      return;
    }

    try {
      this.client = await this.createClient();
      this.isInitialized = true;

      // Set up event handlers after client is initialized
      await this.eventService.setupEventHandlers();

      this.logger.log("Telegram client initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Telegram client:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    console.log("onModuleDestroy");
    if (this.client) {
      try {
        await this.client.disconnect();
        this.client = null;
        this.isInitialized = false;
        this.logger.log("Telegram client disconnected");
      } catch (error) {
        this.logger.error("Error disconnecting Telegram client:", error);
        throw error;
      }
    }
  }

  private async createClient(): Promise<TelegramClient> {
    try {
      const session = new StringSession(this.stringSession);
      const client = new TelegramClient(session, this.apiId, this.apiHash, {
        connectionRetries: 5,
      });

      await client.connect();
      return client;
    } catch (error) {
      this.logger.error("Failed to create Telegram client:", error);
      throw error;
    }
  }

  getClient(): TelegramClient {
    if (!this.client || !this.isInitialized) {
      throw new Error("Telegram client not initialized");
    }
    return this.client;
  }

  getGroupIds(): string[] {
    return this.groupIds;
  }

  getGroupServices(): Map<string, GroupService> {
    return this.groupServices;
  }

  getEventService(): EventService {
    return this.eventService;
  }
}
