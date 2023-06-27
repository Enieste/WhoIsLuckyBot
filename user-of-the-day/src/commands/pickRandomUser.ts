import TelegramBot from 'node-telegram-bot-api';
import type { CleanedMessage } from '../utils/types';
import { startOfDay } from 'date-fns';
import { prisma, updateUser } from '../db';
import { getRandomFromNumber } from '../utils';

type ChatId = number;
type UserId = number;
let pickingUserNow = false;
const memoizedUsersPerChat: Record<ChatId, [UserId, Date]> = {};

export const pickRandomUser = (bot: TelegramBot) => async (msg: CleanedMessage) => {
  const getRandomUserForChat = async (
    chatId: number
  ): Promise<number | null> => {
    if (
      memoizedUsersPerChat[chatId] &&
      startOfDay(memoizedUsersPerChat[chatId][1]) === startOfDay(Date.now())
    )
      return memoizedUsersPerChat[chatId][0];

    const gameParticipants = await prisma.userChatStats.findMany({
      where: {
        chatId: chatId,
      },
    });

    if (!gameParticipants.length) return null;

    const randomUser =
      gameParticipants[getRandomFromNumber(gameParticipants.length)];
    memoizedUsersPerChat[chatId] = [randomUser.userId, new Date()];
    return randomUser.userId;
  };

  if (pickingUserNow)
    return bot.sendMessage(msg.chat.id, 'Calculating best user, please wait');
  pickingUserNow = true;
  const MAX_TRIES = 20;
  const recurse = async (msg: CleanedMessage, tries: number) => {
    if (tries >= MAX_TRIES)
      return bot.sendMessage(msg.chat.id, 'Sorry no users found');
    const chatId = msg.chat.id;
    const randomUserId = await getRandomUserForChat(chatId);
    if (randomUserId === null)
      return bot.sendMessage(msg.chat.id, 'No users to choose from (');

    const userInfo = await bot.getChatMember(chatId, randomUserId);
    if (userInfo.status === 'left') {
      await updateUser({
        userId: userInfo.user.id,
        chatId,
        username: userInfo.user.username,
        status: 'gone',
      });
      await recurse(msg, tries + 1);
    }
    return bot.sendMessage(
      msg.chat.id,
      `user - ${
        userInfo.user.username
          ? `@${userInfo.user.username}`
          : `${userInfo.user.first_name}`
      }`
    );
  };
  return recurse(msg, 0).finally(() => {
    pickingUserNow = false;
  });
};
