import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TelegramClient as TelegramClientEntity } from "../../database/entities/telegram-client.entity";
import { ClientService } from "./client.service";
import { ClientFactory } from "./client.factory";

interface ActiveClient {
  clientService: ClientService;
  config: TelegramClientEntity;
}

@Injectable()
export class ClientManagerService {
  private readonly logger = new Logger(ClientManagerService.name);
  private activeClients: Map<number, ActiveClient> = new Map();

  constructor(
    @InjectRepository(TelegramClientEntity)
    private clientRepository: Repository<TelegramClientEntity>,
    private readonly clientFactory: ClientFactory
  ) {}

  async start() {
    await this.initializeClients();
  }

  async stop() {
    await this.disconnectAllClients();
  }

  private async initializeClients() {
    try {
      const configs = await this.clientRepository.find({
        where: { isActive: true },
      });

      for (const config of configs) {
        await this.initializeClient(config);
      }

      this.logger.log(
        `Initialized ${this.activeClients.size} Telegram clients`
      );
    } catch (error) {
      this.logger.error("Failed to initialize clients:", error);
      throw error;
    }
  }

  private async initializeClient(
    config: TelegramClientEntity,
    maxRetries: number = 3
  ): Promise<ActiveClient | null> {
    try {
      const clientService = this.clientFactory.createClient(
        config.apiId,
        config.apiHash,
        config.stringSession,
        config.groupIds,
        config.minReplyDelayMinutes,
        config.maxReplyDelayMinutes,
        config.minReactionDelayMinutes,
        config.maxReactionDelayMinutes
      );

      await clientService.onModuleInit();

      const activeClient = { clientService, config };
      this.activeClients.set(config.id, activeClient);

      this.logger.log(`Client ${config.id} initialized successfully`);
      return activeClient;
    } catch (error) {
      this.logger.error(`Failed to initialize client ${config.id}:`, error);
      if (maxRetries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return this.initializeClient(config, maxRetries - 1);
      }
      return null;
    }
  }

  private async disconnectAllClients() {
    for (const [id, { clientService }] of this.activeClients) {
      try {
        await clientService.onModuleDestroy();
        this.logger.log(`Client ${id} disconnected`);
      } catch (error) {
        this.logger.error(`Error disconnecting client ${id}:`, error);
      }
    }
    this.activeClients.clear();
  }

  async addClient(
    clientConfig: Partial<TelegramClientEntity>
  ): Promise<TelegramClientEntity> {
    const config = this.clientRepository.create(clientConfig);
    const savedConfig = await this.clientRepository.save(config);

    await this.initializeClient(savedConfig);

    return savedConfig;
  }

  async removeClient(id: number): Promise<void> {
    const activeClient = this.activeClients.get(id);
    if (activeClient) {
      await activeClient.clientService.onModuleDestroy();
      this.activeClients.delete(id);
    }
    await this.clientRepository.update(id, { isActive: false });
  }

  getClient(id: number): ClientService | undefined {
    return this.activeClients.get(id)?.clientService;
  }

  getClientConfig(id: number): TelegramClientEntity | undefined {
    return this.activeClients.get(id)?.config;
  }

  getAllClients(): Map<number, ActiveClient> {
    return this.activeClients;
  }
}
