import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './services/telegram.service';
import { ClientService } from './services/client.service';
import { EventService } from './services/event.service';
import { MessageService } from './services/message.service';
import telegramConfig from './config/telegram.config';

@Module({
  imports: [
    ConfigModule.forFeature(telegramConfig),
  ],
  providers: [
    ClientService,
    EventService,
    MessageService,
    TelegramService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}