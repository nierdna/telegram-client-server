import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import telegramConfig from './telegram/config/telegram.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [telegramConfig],
    }),
    DatabaseModule,
    TelegramModule,
    HealthModule,
  ],
})
export class AppModule {}