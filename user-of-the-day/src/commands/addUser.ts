import type { CleanedMessage } from '../utils/types';
import { prisma, updateUser } from '../db';
import type TelegramBot from 'node-telegram-bot-api';

export const registerNewUser =
  (bot: TelegramBot) => async (msg: CleanedMessage) => {
    console.log('from register', msg);
    const userId = msg.from.id;

    const firstName = msg.from.first_name;
    const uniqWhere = {
      userId,
      chatId: msg.chat.id,
    };
    const existing = await prisma.userChatStats.findUnique({
      where: {
        userId_chatId: uniqWhere,
      },
    });
    if (existing) {
      await bot.sendMessage(msg.chat.id, `${firstName}, вы уже в игре.`);
      return;
    }

    await updateUser({
      ...uniqWhere,
      username: msg.from.username,
      status: 'here',
    });

    return bot.sendMessage(
      msg.chat.id,
      `${firstName}, добро пожаловать в игру. Осталось только дождаться...`
    );
  };
