import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TelegramService } from "./services/telegram.service";
import { ClientService } from "./services/client.service";
import { EventService } from "./services/event.service";
import { MessageService } from "./services/message.service";
import { ResponseService } from "./services/response.service";
import { ReactionService } from "./services/reaction.service";
import telegramConfig from "./config/telegram.config";
import aiReplyAssistantConfig from "./config/ai-reply-assistant.config";

@Module({
  imports: [
    ConfigModule.forFeature(telegramConfig),
    ConfigModule.forFeature(aiReplyAssistantConfig),
  ],
  providers: [
    ClientService,
    EventService,
    MessageService,
    ResponseService,
    ReactionService,
    TelegramService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}