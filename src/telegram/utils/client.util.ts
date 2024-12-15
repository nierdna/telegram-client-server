import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { TelegramConfig } from '../interfaces/telegram-config.interface';

export async function createTelegramClient(config: TelegramConfig): Promise<TelegramClient> {
  try {
    const stringSession = new StringSession(config.stringSession);
    
    const client = new TelegramClient(
      stringSession,
      config.apiId,
      config.apiHash,
      {
        connectionRetries: 5,
      }
    );

    await client.connect();
    
    return client;
  } catch (error) {
    throw error;
  }
}