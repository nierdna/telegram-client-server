import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TelegramClient } from "./entities/telegram-client.entity";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";
import databaseConfig from "./config/database.config";

@Module({
  imports: [
    TelegramClient,
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("database.host"),
        port: configService.get("database.port"),
        username: configService.get("database.username"),
        password: configService.get("database.password"),
        database: configService.get("database.database"),
        entities: [TelegramClient],
        synchronize: configService.get("database.synchronize"),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TelegramClient]),
  ],
  exports: [TypeOrmModule, TelegramClient],
})
export class DatabaseModule {}
