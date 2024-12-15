import { Logger } from '@nestjs/common';
import { TelegramEvent } from '../interfaces/telegram-event.interface';
import { Message } from '../interfaces/message.interface';

export class MessageHandler {
  private readonly logger = new Logger(MessageHandler.name);

  constructor(private readonly groupIds: string[]) {}

  getNewMessageOptions() {
    return {
      chats: this.groupIds
    };
  }

  async handleNewMessage(event: any): Promise<TelegramEvent | null> {
    try {
      if (!this.isValidGroupMessage(event)) {
        return null;
      }

      const message = this.parseMessage(event);
      return this.createTelegramEvent(message);
    } catch (error) {
      this.logger.error('Error handling new message:', error);
      return null;
    }
  }

  private isValidGroupMessage(event: any): boolean {
    const chatId = event.message?.chat?.id?.toString();
    return this.groupIds.includes(chatId);
  }

  private parseMessage(event: any): Message {
    return {
      id: event.message.id,
      text: event.message.text || '',
      date: new Date(event.message.date * 1000), // Convert Unix timestamp to Date
      fromId: event.message.from?.id
    };
  }

  private createTelegramEvent(message: Message): TelegramEvent {
    return {
      message,
      type: 'new_message',
      timestamp: new Date()
    };
  }
}