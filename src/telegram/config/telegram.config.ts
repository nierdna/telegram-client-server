import { registerAs } from '@nestjs/config';

export default registerAs('telegram', () => ({
  apiId: Number(process.env.TELEGRAM_API_ID),
  apiHash: process.env.TELEGRAM_API_HASH,
  stringSession: process.env.TELEGRAM_STRING_SESSION,
  groupId: process.env.TELEGRAM_GROUP_ID,
}));