import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TelegramModule } from "./telegram/telegram.module";
import { HealthModule } from "./health/health.module";
import telegramConfig from "./telegram/config/telegram.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [telegramConfig],
    }),
    TelegramModule,
    HealthModule,
  ],
})
export class AppModule {}