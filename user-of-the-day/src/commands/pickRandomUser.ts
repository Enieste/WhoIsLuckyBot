import TelegramBot from 'node-telegram-bot-api';
import type { CleanedMessage, Designation } from '../utils/types';
import { LOSER, WINNER } from '../utils/types';
import { addCount, prisma, updateUser } from '../db';
import { getRandomFromNumber } from '../utils';
import { isEqual, startOfDay } from 'date-fns';
import { sendSearchMessages } from './setMessage';
import { UserChatStats } from "@prisma/client";

let pickingUserNow = false;
const loserTitle = process.env.LOSER_TITLE || 'неудачник';

type RandomUserPickResult =
  | {
      tag: 'error';
      message: string;
    }
  | {
      tag: 'success';
      member: UserChatStats;
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

      console.log('chatId / randomUserId', chatId, Number(randomUserId))

      // const selectedUser = await bot.getChatMember(
      //   chatId,
      //   Number(randomUserId)
      // ); Telegram bot forgets users eventually and cannot catch their data. Only errors.

      const uniqWhere = {
        userId: randomUserId,
        chatId
      };

      const selectedUser = await prisma.userChatStats.findUnique({
        where: {
          userId_chatId: uniqWhere
        },
      });

      if (selectedUser === null) {
        return {
          tag: 'error',
          message: 'Пользователь не найден',
        };
      }

      // if (selectedUser.status === 'left') {
      //   await updateUser({
      //     userId: selectedUser.user.id,
      //     chatId,
      //     username: selectedUser.user.username,
      //     firstName: selectedUser.user.first_name,
      //     status: 'gone',
      //   });
      //   await recurse(msg, tries + 1);
      // }   Telegram gives an error if user is not in the chat anymore

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
      `${
        selectedDude.member.username_transient
          ? `${selectedDude.member.firstName_transient} (@${selectedDude.member.username_transient}) назначается ${messagePrefix}`
          : `${selectedDude.member.firstName_transient} назначается ${messagePrefix}`
      }`
    );
  };

export const getWinner = getDude(WINNER, 'котиком дня 🐈');
export const getLoser = getDude(LOSER, `${loserTitle}ом дня 🌈`);
