import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TelegramClient } from "../database/entities/telegram-client.entity";
import { ClientManagerService } from "./services/client-manager.service";
import { ClientFactory } from "./services/client.factory";
import telegramConfig from "./config/telegram.config";
import { MessageService } from "./services/message.service";

@Module({
  imports: [
    ConfigModule.forFeature(telegramConfig),
    TypeOrmModule.forFeature([TelegramClient]),
  ],
  providers: [ClientManagerService, ClientFactory, MessageService],
  exports: [ClientManagerService],
})
export class TelegramModule {}
