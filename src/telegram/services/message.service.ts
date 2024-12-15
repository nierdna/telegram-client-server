import { Injectable, Logger } from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { Message } from '../interfaces/message.interface';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  async sendMessage(client: TelegramClient, groupId: string, message: string): Promise<void> {
    try {
      await client.sendMessage(groupId, { message });
      this.logger.log(`Message sent successfully to group ${groupId}`);
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      throw error;
    }
  }

  async getMessages(client: TelegramClient, groupId: string, limit: number = 100): Promise<Message[]> {
    try {
      const messages = await client.getMessages(groupId, { limit });
      return messages.map(msg => ({
        id: msg.id,
        text: msg.text || '',
        date: new Date(msg.date * 1000),
        fromId: msg.fromId,
      })) as any;
    } catch (error) {
      this.logger.error('Failed to get messages:', error);
      throw error;
    }
  }
}