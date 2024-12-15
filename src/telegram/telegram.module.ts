import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TelegramClient } from "../database/entities/telegram-client.entity";
import { ClientFactory } from "./services/client.factory";
import telegramConfig from "./config/telegram.config";
import { MessageService } from "./services/message.service";
import { TelegramService } from "./telegram.service";
import { ClientManagerService } from "./services/client-manager.service";

@Module({
  imports: [
    ConfigModule.forFeature(telegramConfig),
    TypeOrmModule.forFeature([TelegramClient]),
  ],
  providers: [
    TelegramService,
    ClientFactory,
    MessageService,
    ClientManagerService,
  ],
  exports: [],
})
export class TelegramModule {}
