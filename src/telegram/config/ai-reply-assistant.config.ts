import { registerAs } from "@nestjs/config";

export const aiReplyAssistantConfig = registerAs("aiReplyAssistant", () => ({
  apiUrl: process.env.AI_REPLY_ASSISTANT_URL || "",
}));
