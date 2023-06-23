import TelegramBot, {Message} from 'node-telegram-bot-api';
import pick from 'lodash/pick';
import { startOfDay } from 'date-fns';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(
  {
    datasources: {
      db: {
        url: 'file:dev.db'
      }
    }
  }
);

const token = process.env.TOKEN;
if (!token) throw new Error('no process.env.TOKEN');

// message with command
type ValidMessage = Omit<TelegramBot.Message, 'from'> & {
  from: Exclude<TelegramBot.Message['from'], undefined>
}
// no command and metadata anymore
type CleanedMessage = Pick<ValidMessage, 'from' | 'chat' | 'date'>;

const cleanMsgObj = (msg: ValidMessage): CleanedMessage =>
  pick(msg, ['from', 'chat', 'date'] as const);

const BOT_NAME = 'WhoIsLuckyTodayBot';

const bot = new TelegramBot(token, { polling: true });

const updateUser = async ({ userId, chatId, username, status }: {userId: number, chatId: number, username?: string, status: 'here' | 'gone'}) => {
  const uniqWhere = {
    userId,
    chatId,
  };
  const deactivatedAt = status === "here" ? null : new Date();
  await prisma.chat.upsert({
    where: {
      id: uniqWhere.chatId
    },
    create: {
      id: uniqWhere.chatId
    },
    update: {

    }
  })
  await prisma.userChatStats.upsert({
    where: {
      userId_chatId: uniqWhere
    },
    create: {
      userCount: 0,
      loserCount: 0,
      username_transient: username,
      deactivated_at: deactivatedAt,
      ...uniqWhere
    },
    update: {
      ...(username ? {username_transient: username} : {}),
      deactivated_at: deactivatedAt
    }
  });
};

const getRandomFromNumber = (n: number): number => Math.floor(Math.random() * n);

type ChatId = number;
type UserId = number;
const memoizedUsersPerChat: Record<ChatId, [UserId, Date]> = {

};

const getRandomUserForChat = async (chatId: number): Promise<number | null> => {
  if (memoizedUsersPerChat[chatId] && startOfDay(memoizedUsersPerChat[chatId][1]) === startOfDay(Date.now())) return memoizedUsersPerChat[chatId][0];
  const gameParticipants = await prisma.userChatStats.findMany({
    where: {
      chatId: chatId
    }
  });
  if (!gameParticipants.length) return null;
  const randomUser = gameParticipants[getRandomFromNumber(gameParticipants.length)];
  console.log("part", gameParticipants, randomUser);
  memoizedUsersPerChat[chatId] = [randomUser.userId, new Date()];
  return randomUser.userId;
};

let pickingUserNow = false;
const pickRandomUser = async (msg: CleanedMessage) => {
  if (pickingUserNow) return bot.sendMessage(msg.chat.id, "Calculating best user, please wait");
  pickingUserNow = true;
  const MAX_TRIES = 20;
  const recurse = async (msg: CleanedMessage, tries: number) => {
    if (tries >= MAX_TRIES) return bot.sendMessage(msg.chat.id, "Sorry no users found");
    const chatId = msg.chat.id;
    const randomUserId = await getRandomUserForChat(chatId);
    if (randomUserId === null) return bot.sendMessage(msg.chat.id, "No users to choose from (")

    const userInfo = await bot.getChatMember(chatId, randomUserId);
    if (userInfo.status === "left") {
      await updateUser({
        userId: userInfo.user.id,
        chatId,
        username: userInfo.user.username,
        status: 'gone'
      })
      await recurse(msg, tries + 1);
    }
    return bot.sendMessage(msg.chat.id, `user - ${userInfo.user.username ? `@${userInfo.user.username}` : `${userInfo.user.first_name}`}`);
  }
  return recurse(msg, 0).finally(() => {
    pickingUserNow = false;
  });
};



const registerNewUser = async (msg: CleanedMessage) => {
  console.log('from register', msg)
  const userId = msg.from.id;

  const firstName = msg.from.first_name;
  const uniqWhere = {
    userId,
    chatId: msg.chat.id,
  };
  const existing = await prisma.userChatStats.findUnique({
    where: {
      userId_chatId: uniqWhere
    }
  });
  if (existing) {
    await bot.sendMessage(msg.chat.id, `${firstName}, вы уже в игре.`);
    return;
  }

  await updateUser({
    ...uniqWhere,
    username: msg.from.username,
    status: 'here'
  });

  return bot.sendMessage(msg.chat.id, `${firstName}, добро пожаловать в игру. Осталось только дождаться...`);
};

const runCommands = {
  finduser: pickRandomUser,
  adduser: registerNewUser,
  stat_user: (message: CleanedMessage) => 'show statistics',
  loser: (message: CleanedMessage) => 'find loser',
  stat_loser: (message: CleanedMessage) => 'stat losers',
};

const ACCEPTED_COMMANDS = Object.keys(runCommands) as (keyof typeof runCommands)[];

// Listen for any kind of message. There are different kinds of
// messages.
  bot.on('message', (msg) => {
    console.log(msg)
    const messageIsCommand = (msg: TelegramBot.Message): msg is typeof msg & {
      text: string
    } => (msg.text || '')[0] === '/';
    if (!messageIsCommand(msg)) {
      console.log("Message isn'r command", msg)
      return;
    }

    const indexOfBotName = msg.text.indexOf(`@${BOT_NAME}`);
    const command = msg.text.substring(1, indexOfBotName === -1 ? undefined : indexOfBotName);
    const isCommandAccepted = (command: string): command is typeof ACCEPTED_COMMANDS[number] =>
      ACCEPTED_COMMANDS.indexOf(command as typeof ACCEPTED_COMMANDS[number]) !== -1;
    if (!isCommandAccepted(command)) {
      console.log(`Command wasn't accepted: ${command}`)
      return;
    }
    const isFromHere = <T extends {from?: TelegramBot.User}>(m: T): m is T & {
      from: TelegramBot.User
    } => !!m.from;
    if (!isFromHere(msg)) {
      console.log("Doesn't have From field")
      return;
    }
    console.log('command accepted', command)
    runCommands[command](cleanMsgObj(msg));
  });



// {
//   message_id: 91,
//     from: {
//   id: 181633052,
//     is_bot: false,
//     first_name: 'Victoria',
//     username: 'enieste',
//     language_code: 'en',
//     is_premium: true
// },
//   chat: {
//     id: -696642173,
//       title: 'test',
//       type: 'group',
//       all_members_are_administrators: true
//   },
//   date: 1687517724,
//     new_chat_participant: {
//   id: 2072217821,
//     is_bot: false,
//     first_name: 'Hisa',
//     username: 'aresusa'
// },
//   new_chat_member: {
//     id: 2072217821,
//       is_bot: false,
//       first_name: 'Hisa',
//       username: 'aresusa'
//   },
//   new_chat_members: [
//     {
//       id: 2072217821,
//       is_bot: false,
//       first_name: 'Hisa',
//       username: 'aresusa'
//     }
//   ]
// }

//admin kicked
// {
//   message_id: 92,
//     from: {
//   id: 181633052,
//     is_bot: false,
//     first_name: 'Victoria',
//     username: 'enieste',
//     language_code: 'en',
//     is_premium: true
// },
//   chat: {
//     id: -696642173,
//       title: 'test',
//       type: 'group',
//       all_members_are_administrators: true
//   },
//   date: 1687517796,
//     left_chat_participant: {
//   id: 2072217821,
//     is_bot: false,
//     first_name: 'Hisa',
//     username: 'aresusa'
// },
//   left_chat_member: {
//     id: 2072217821,
//       is_bot: false,
//       first_name: 'Hisa',
//       username: 'aresusa'
//   }
// }

// user quit
// {
//   message_id: 94,
//     from: {
//   id: 2072217821,
//     is_bot: false,
//     first_name: 'Hisa',
//     username: 'aresusa'
// },
//   chat: {
//     id: -696642173,
//       title: 'test',
//       type: 'group',
//       all_members_are_administrators: true
//   },
//   date: 1687517912,
//     left_chat_participant: {
//   id: 2072217821,
//     is_bot: false,
//     first_name: 'Hisa',
//     username: 'aresusa'
// },
//   left_chat_member: {
//     id: 2072217821,
//       is_bot: false,
//       first_name: 'Hisa',
//       username: 'aresusa'
//   }
// }
//
// SELECT title FROM albums
// ORDER BY random()
// LIMIT 1;

//Math.floor((Math.random() * numberofusers));

// finduser - чтобы найти котика дня
// findloser - чтобы найти пидора дня
// adduser - чтобы участвовать
// stats - статистика участников