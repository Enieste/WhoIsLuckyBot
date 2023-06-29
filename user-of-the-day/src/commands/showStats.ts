import TelegramBot from 'node-telegram-bot-api';
import { CleanedMessage } from '../utils/types';
import { prisma } from '../db';
import { ms } from 'date-fns/locale';

export const showStats =
  (bot: TelegramBot) =>
  async (msg: CleanedMessage): Promise<void> => {
    // get all records by chat
    const allChatRecords = await prisma.userChatStats.findMany({
      where: {
        chatId: msg.chat.id,
      },
    });
    console.log(allChatRecords);
    bot.sendMessage(msg.chat.id, 'staats');
  };
