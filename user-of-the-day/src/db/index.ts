import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:dev.db',
    },
  },
});
export const updateUser = async ({
  userId,
  chatId,
  username,
  status,
}: {
  userId: number;
  chatId: number;
  username?: string;
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
      deactivated_at: deactivatedAt,
      ...uniqWhere,
    },
    update: {
      ...(username ? { username_transient: username } : {}),
      deactivated_at: deactivatedAt,
    },
  });
};
