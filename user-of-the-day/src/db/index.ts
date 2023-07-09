import { PrismaClient } from '@prisma/client';
import {LOSER, Designation, WINNER} from '../utils/types';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('process.env.DATABASE_URL is empty');
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  },
});
export const updateUser = async ({
  userId,
  chatId,
  username,
  firstName,
  status,
}: {
  userId: number;
  chatId: number;
  username?: string;
  firstName: string;
  status: 'here' | 'gone';
}) => {
  const uniqWhere = {
    userId,
    chatId,
  };
  const deactivatedAt = status === 'here' ? null : new Date();
  await prisma.chat.upsert({
    where: {
      id: uniqWhere.chatId,
    },
    create: {
      id: uniqWhere.chatId,
    },
    update: {},
  });
  await prisma.userChatStats.upsert({
    where: {
      userId_chatId: uniqWhere,
    },
    create: {
      userCount: 0,
      loserCount: 0,
      username_transient: username,
      firstName_transient: firstName,
      deactivated_at: deactivatedAt,
      ...uniqWhere,
    },
    update: {
      ...(username ? { username_transient: username } : {}),
      firstName_transient: firstName,
      deactivated_at: deactivatedAt,
    },
  });
};

export const addCount = (tx: Pick<PrismaClient, 'userChatStats'>) => async ({
  userId,
  chatId,
  title,
}: {
  userId: bigint;
  chatId: bigint;
  title: Designation;
}) => {
  const uniqWhere = {
    userId,
    chatId,
  };
  const increment1 = { increment: 1 };
  await tx.userChatStats.update({
    where: {
      userId_chatId: uniqWhere,
    },
    data: {
      ...(title === LOSER
        ? { loserCount: increment1 }
        : { userCount: increment1 }),
    },
  });
};

export const addCustomChatSearchMessages = async ({
  chatId,
  tag,
  messagesString
}: {
  chatId: number;
  tag: string;
  messagesString: string;
}) => {
  const msg = messagesString ? messagesString : null;
  const setMessageObg = {
    ...(tag === WINNER ? { userSearchMessage: msg } : {}),
    ...(tag === LOSER ? { loserSearchMessage: msg } : {}),
  };
  await prisma.chat.upsert({
    where: {
      id: chatId,
    },
    create: setMessageObg,
    update: setMessageObg,
  });
};