import TelegramBot from 'node-telegram-bot-api';
import {CleanedMessage, Designation, LOSER, WINNER} from '../utils/types';
import { prisma } from '../db';
import {orderBy} from "lodash";
import {capitalize} from "../utils";
import {UserChatStats} from "@prisma/client";

const loserTitle = process.env.LOSER_TITLE || 'неудачник';
const messageCharLimit = 4096;
const composeMessage = (title: Designation, records: UserChatStats[]): string => {
  const heading = `Результаты ${ title === LOSER ? `🌈 ${capitalize(loserTitle)}` : '🐈 Котик' } Дня:\n`;
  const usersList = records.reduce((acc, current, index): { res: string, finished: boolean } => {
    if (acc.finished) return acc;
    const userString = `${index + 1}) ${current.firstName_transient}${current.username_transient ?` (@${current.username_transient})` : ''} - ${title === LOSER ? current.loserCount : current.userCount} раз(а)\n`;
    if (acc.res.length + userString.length > messageCharLimit + heading.length) {
      return { ...acc, finished: true };
    }
    return { ...acc, res: acc.res + userString }
  }, { res: '', finished: false });
  return heading + usersList.res;
}
export const showStats =
  (bot: TelegramBot) =>
  async (msg: CleanedMessage): Promise<void> => {
    // get all records by chat
    const allChatRecords = await prisma.userChatStats.findMany({
      where: {
        chatId: msg.chat.id,
      },
    });
    const losers = orderBy(allChatRecords, (r) => r.loserCount, 'desc');
    const winners = orderBy(allChatRecords, (r) => r.userCount, 'desc');
    console.log('losers', losers, 'winners', winners);
    await bot.sendMessage(msg.chat.id, composeMessage(WINNER, winners));
    await bot.sendMessage(msg.chat.id, composeMessage(LOSER, losers));
  };

