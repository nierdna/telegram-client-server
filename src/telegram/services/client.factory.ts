import { Injectable } from "@nestjs/common";
import { ClientService } from "./client.service";
import { MessageService } from "./message.service";

@Injectable()
export class ClientFactory {
  constructor(private readonly messageService: MessageService) {}

  createClient(
    apiId: number,
    apiHash: string,
    stringSession: string,
    groupIds: string[],
    minReplyDelay: number = 1,
    maxReplyDelay: number = 5,
    minReactionDelay: number = 2,
    maxReactionDelay: number = 8
  ): ClientService {
    return new ClientService(
      apiId,
      apiHash,
      stringSession,
      groupIds,
      this.messageService,
      minReplyDelay,
      maxReplyDelay,
      minReactionDelay,
      maxReactionDelay
    );
  }
}
