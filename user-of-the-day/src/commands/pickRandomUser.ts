import TelegramBot from 'node-telegram-bot-api';
import type { CleanedMessage, Designation } from '../utils/types';
import { LOSER, WINNER } from '../utils/types';
import { addCount, prisma, updateUser } from '../db';
import { capitalize, getRandomFromNumber } from '../utils';
import { isEqual, startOfDay } from 'date-fns';
import { sendSearchMessages } from './setMessage';

let pickingUserNow = false;
const loserTitle = process.env.LOSER_TITLE || 'неудачник';

type RandomUserPickResult =
  | {
      tag: 'error';
      message: string;
    }
  | {
      tag: 'success';
      member: TelegramBot.ChatMember;
    };

const designationToIdField = (d: Designation) =>
  d === LOSER ? ('currentLoserId' as const) : ('currentUserId' as const);
const designationToLastDrawDateField = (d: Designation) =>
  d === LOSER
    ? ('lastLoserDrawDate' as const)
    : ('lastWinnerDrawDate' as const);

export const pickRandomUser =
  (bot: TelegramBot) =>
  async (
    msg: CleanedMessage,
    title: Designation
  ): Promise<RandomUserPickResult> => {
    const getRandomUserForChat = async (
      chatId: bigint,
      tries: number
    ): Promise<bigint | null> => {
      // cache logic
      const chat = await prisma.chat.findUnique({
        where: {
          id: msg.chat.id,
        },
      });

      console.log('chat', chat);

      const fieldToCheck = designationToLastDrawDateField(title);
      const lastDrawDate = chat && chat[fieldToCheck];
      if (
        lastDrawDate &&
        isEqual(startOfDay(lastDrawDate), startOfDay(Date.now()))
      ) {
        return chat[designationToIdField(title)];
      }
      // ^ cache logic

      if (tries === 0) {
        await bot.sendMessage(
          msg.chat.id,
          `Начинаю поиск ${
            title === LOSER ? loserTitle + 'a' : 'котика'
          } дня...`
        );
        if (title === LOSER && chat && chat.loserSearchMessage) {
          await sendSearchMessages(bot, msg.chat.id, chat.loserSearchMessage);
        } else if (title === WINNER && chat && chat.userSearchMessage) {
          await sendSearchMessages(bot, msg.chat.id, chat.userSearchMessage);
        }
      }

      const gameParticipants = await prisma.userChatStats.findMany({
        where: {
          chatId: chatId,
        },
      });

      if (!gameParticipants.length) return null;

      const randomUser =
        gameParticipants[getRandomFromNumber(gameParticipants.length)];
      await prisma.$transaction(async (tx) => {
        await Promise.all([
          addCount(tx)({
            userId: randomUser.userId,
            chatId: BigInt(msg.chat.id),
            title,
          }),
          tx.chat.update({
            where: {
              id: msg.chat.id,
            },
            data: {
              [designationToIdField(title)]: randomUser.userId,
              [fieldToCheck]: new Date(),
            },
          }),
        ]);
      });

      return randomUser.userId;
    };

    if (pickingUserNow)
      return {
        tag: 'error',
        message: 'Calculating user, please wait',
      };
    pickingUserNow = true;
    const MAX_TRIES = 20;
    const recurse = async (
      msg: CleanedMessage,
      tries: number
    ): Promise<RandomUserPickResult> => {
      if (tries >= MAX_TRIES)
        return {
          tag: 'error',
          message: 'Sorry no users found',
        };
      const chatId = msg.chat.id;
      const randomUserId = await getRandomUserForChat(BigInt(chatId), tries);
      if (randomUserId === null)
        return {
          tag: 'error',
          message: 'No users to choose from',
        };

      const selectedUser = await bot.getChatMember(
        chatId,
        Number(randomUserId)
      );
      if (selectedUser.status === 'left') {
        await updateUser({
          userId: selectedUser.user.id,
          chatId,
          username: selectedUser.user.username,
          firstName: selectedUser.user.first_name,
          status: 'gone',
        });
        await recurse(msg, tries + 1);
      }
      return {
        tag: 'success',
        member: selectedUser,
      };
    };
    return recurse(msg, 0).finally(() => {
      pickingUserNow = false;
    });
  };

const getDude =
  (tag: Designation, messagePrefix: string) =>
  (bot: TelegramBot) =>
  async (msg: CleanedMessage): Promise<void> => {
    const selectedDude = await pickRandomUser(bot)(msg, tag);
    if (selectedDude.tag === 'error') {
      await bot.sendMessage(msg.chat.id, selectedDude.message);
      return;
    }
    await bot.sendMessage(
      msg.chat.id,
      `${messagePrefix} — ${
        selectedDude.member.user.username
          ? `${selectedDude.member.user.first_name} (@${selectedDude.member.user.username})`
          : `${selectedDude.member.user.first_name}`
      }`
    );
  };

export const getWinner = getDude(WINNER, '🐈 Котик дня');
export const getLoser = getDude(LOSER, `🌈 ${capitalize(loserTitle)} дня`);
