import { Message } from "../interfaces/message.interface";
import { ClientService } from "./client.service";
import { ReactionService } from "./reaction.service";
import { ResponseService } from "./response.service";
import { MessageService } from "./message.service";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { Api } from "telegram";

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
    if (this.messages.length === 0) {
      const historicalMessages = await this.clientService
        .getClient()
        .getMessages(this.groupId, {
          limit: 100,
        });

      this.messages.push(
        ...historicalMessages.reverse().map((msg) => ({
          user:
            (msg.sender as Api.User)?.username ||
            msg.sender?.id?.toString() ||
            "unknown",
          content: msg.text || "",
        }))
      );
    } else {
      this.messages.push({ user: message.fromUser, content: message.text });
    }

    // limit messages to 300
    if (this.messages.length > 300) {
      this.messages = this.messages.slice(-300);
    }

    try {
      await this.responseService.handleMessageConversation(
        this.formatMessage(this.messages),
        this.clientService.getClient(),
        message.id
      );
    } catch (error) {
      this.logger.error(`Failed to handle response for group ${this.groupId}:`);
      throw error;
    }
  }

  private formatMessage(
    messages: {
      user: string;
      content: string;
    }[]
  ) {
    return messages.map((item) => ({
      ...item,
      user: item.user === this.clientService.getUsername() ? "You" : item.user,
    }));
  }
}
