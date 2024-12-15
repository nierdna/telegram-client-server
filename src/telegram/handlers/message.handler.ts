import { Logger } from '@nestjs/common';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { TelegramEvent } from '../interfaces/telegram-event.interface';
import { Message } from '../interfaces/message.interface';

export class MessageHandler {
  private readonly logger = new Logger(MessageHandler.name);

  constructor(private readonly groupId: string) {}

  getNewMessageOptions() {
    return {
      chats: [this.groupId]
    };
  }

  async handleNewMessage(event: NewMessageEvent): Promise<TelegramEvent | null> {
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

  private isValidGroupMessage(event: NewMessageEvent): boolean {
    return true;
    return event.message?.chat?.id?.toString() === this.groupId;
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