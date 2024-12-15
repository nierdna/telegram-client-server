import { Message } from './message.interface';

export interface TelegramEvent {
  message?: Message;
  type: string;
  timestamp: Date;
}