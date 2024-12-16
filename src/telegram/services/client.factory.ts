import { Injectable } from "@nestjs/common";
import { ClientService } from "./client.service";
import { MessageService } from "./message.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ClientFactory {
  constructor(
    private readonly messageService: MessageService,
    private readonly configService: ConfigService
  ) {}

  createClient(
    apiId: number,
    apiHash: string,
    stringSession: string,
    groupIds: string[],
    minReplyDelay: number = 1,
    maxReplyDelay: number = 5,
    minReactionDelay: number = 2,
    maxReactionDelay: number = 8,
    characterId: string
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
      maxReactionDelay,
      this.configService,
      characterId
    );
  }
}
