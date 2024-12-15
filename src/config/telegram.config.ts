import { registerAs } from '@nestjs/config';

export default registerAs('telegram', () => ({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  groupId: process.env.TELEGRAM_GROUP_ID,
}));