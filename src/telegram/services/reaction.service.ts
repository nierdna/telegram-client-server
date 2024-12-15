import { Injectable, Logger } from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { Message } from '../interfaces/message.interface';
import { Api } from 'telegram';

@Injectable()
export class ReactionService {
  private readonly logger = new Logger(ReactionService.name);
  private readonly REACTIONS = ['👍', '❤️', '🔥', '👏', '🎉', '🤔', '👎', '😢', '😡', '🥰'];
  private nextReactionTime: number | null = null;
  private readonly minDelayMinutes: number;
  private readonly maxDelayMinutes: number;

  constructor(
    minDelayMinutes: number = 2,
    maxDelayMinutes: number = 8
  ) {
    this.validateDelayTimes(minDelayMinutes, maxDelayMinutes);
    this.minDelayMinutes = minDelayMinutes;
    this.maxDelayMinutes = maxDelayMinutes;
  }

  private validateDelayTimes(min: number, max: number): void {
    if (min < 0) {
      throw new Error('Minimum delay cannot be negative');
    }
    if (max <= min) {
      throw new Error('Maximum delay must be greater than minimum delay');
    }
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error('Delay times must be integers');
    }
  }

  async handleReaction(message: Message, client: TelegramClient, groupId: string): Promise<void> {
    const currentTime = Date.now();

    if (!this.shouldReact(currentTime)) {
      return;
    }

    try {
      await this.addRandomReaction(client, groupId, message.id);
      this.updateNextReactionTime();
      
      this.logger.log(`Reaction added. Next reaction scheduled for: ${new Date(this.nextReactionTime!)}`);
    } catch (error) {
      this.logger.error('Failed to add reaction:', error);
    }
  }

  private shouldReact(currentTime: number): boolean {
    if (!this.nextReactionTime) {
      this.updateNextReactionTime();
      return true;
    }

    return currentTime >= this.nextReactionTime;
  }

  private updateNextReactionTime(): void {
    const delayMinutes = this.getRandomDelay();
    this.nextReactionTime = Date.now() + delayMinutes * 60 * 1000;
  }

  private getRandomDelay(): number {
    return Math.floor(
      Math.random() * (this.maxDelayMinutes - this.minDelayMinutes + 1) + 
      this.minDelayMinutes
    );
  }

  private getRandomReaction(): string {
    const randomIndex = Math.floor(Math.random() * this.REACTIONS.length);
    return this.REACTIONS[randomIndex];
  }

  private async addRandomReaction(client: TelegramClient, groupId: string, messageId: number): Promise<void> {
    try {
      const reaction = this.getRandomReaction();
      
      // Create a Reaction object using the Api.Reaction class
      const reactionObj = new Api.ReactionEmoji({
        emoticon: reaction
      });

      // Send the reaction using the correct method
      await client.invoke(new Api.messages.SendReaction({
        peer: groupId,
        msgId: messageId,
        reaction: [reactionObj]
      }));

      this.logger.log(`Added reaction ${reaction} to message ${messageId}`);
    } catch (error) {
      this.logger.error('Failed to add reaction:', error);
      throw error;
    }
  }
}