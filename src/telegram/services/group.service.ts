import { Message } from "../interfaces/message.interface";
import { ClientService } from "./client.service";
import { ReactionService } from "./reaction.service";
import { ResponseService } from "./response.service";
import { MessageService } from "./message.service";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

export class GroupService {
  private readonly logger = new Logger(GroupService.name);
  private readonly reactionService: ReactionService;
  private readonly responseService: ResponseService;
  private messages: { user: string; content: string }[] = [];

  constructor(
    private readonly groupId: string,
    private readonly clientService: ClientService,
    private readonly messageService: MessageService,
    private readonly configService: ConfigService
  ) {
    this.reactionService = new ReactionService(
      this.groupId,
      this.clientService.minReactionDelay,
      this.clientService.maxReactionDelay
    );
    this.responseService = new ResponseService(
      this.groupId,
      this.clientService,
      this.messageService,
      this.clientService.minReplyDelay,
      this.clientService.maxReplyDelay,
      this.configService
    );
  }

  async handleReaction(message: Message) {
    try {
      await this.reactionService.handleReaction(
        message,
        this.clientService.getClient()
      );
    } catch (error) {
      this.logger.error(`Failed to handle reaction for group ${this.groupId}:`);
      throw error;
    }
  }

  async handleResponse(message: Message) {
    this.messages.push({ user: message.fromUser, content: message.text });
    // limit messages to 300
    if (this.messages.length > 300) {
      this.messages = this.messages.slice(-300);
    }
    try {
      await this.responseService.handleMessageConversation(
        this.messages,
        this.clientService.getClient(),
        message.id
      );
    } catch (error) {
      this.logger.error(`Failed to handle response for group ${this.groupId}:`);
      throw error;
    }
  }
}
