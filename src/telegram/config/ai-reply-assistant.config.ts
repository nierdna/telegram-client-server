import { registerAs } from "@nestjs/config";

export default registerAs("ai-reply-assistant", () => ({
  url: process.env.AI_REPLY_ASSISTANT_URL,
}));
