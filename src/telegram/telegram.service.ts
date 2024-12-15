import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ClientManagerService } from "./services/client-manager.service";
import { TelegramClient } from "telegram";

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly clientManagerService: ClientManagerService) {}

  async onModuleInit() {
    try {
      await this.clientManagerService.onModuleInit();
      this.logger.log("✅ - Telegram service initialized successfully");
    } catch (error) {
      this.logger.error("❌ - Failed to initialize Telegram service:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.clientManagerService.onModuleDestroy();
      this.logger.log("✅ - Telegram service destroyed successfully");
    } catch (error) {
      this.logger.error("❌ - Failed to destroy Telegram service:", error);
      throw error;
    }
  }

  async addClient(clientConfig: Partial<TelegramClient>) {
    try {
      return await this.clientManagerService.addClient(clientConfig);
    } catch (error) {
      this.logger.error("Failed to add client:", error);
      throw error;
    }
  }

  async removeClient(id: number): Promise<void> {
    try {
      await this.clientManagerService.removeClient(id);
    } catch (error) {
      this.logger.error(`Failed to remove client ${id}:`, error);
      throw error;
    }
  }

  getClient(id: number) {
    const client = this.clientManagerService.getClient(id);
    if (!client) {
      throw new Error(`Client with id ${id} not found`);
    }
    return client;
  }

  getClientConfig(id: number) {
    const config = this.clientManagerService.getClientConfig(id);
    if (!config) {
      throw new Error(`Client configuration with id ${id} not found`);
    }
    return config;
  }
}
