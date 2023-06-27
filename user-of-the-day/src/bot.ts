import TelegramBot from 'node-telegram-bot-api';
import pick from 'lodash/pick';
import { CleanedMessage, ValidMessage } from './utils/types';
import { registerNewUser } from './commands/addUser';
import { pickRandomUser } from './commands/pickRandomUser';

const token = process.env.TOKEN;
if (!token) throw new Error('no process.env.TOKEN');

const cleanMsgObj = (msg: ValidMessage): CleanedMessage =>
  pick(msg, ['from', 'chat', 'date'] as const);

const BOT_NAME = 'WhoIsLuckyTodayBot';

export const bot = new TelegramBot(token, { polling: true });

// const registerNewUser = async (msg: CleanedMessage) => {
//   console.log('from register', msg)
//   const userId = msg.from.id;
//
//   const firstName = msg.from.first_name;
//   const uniqWhere = {
//     userId,
//     chatId: msg.chat.id,
//   };
//   const existing = await prisma.userChatStats.findUnique({
//     where: {
//       userId_chatId: uniqWhere
//     }
//   });
//   if (existing) {
//     await bot.sendMessage(msg.chat.id, `${firstName}, вы уже в игре.`);
//     return;
//   }
//
//   await updateUser({
//     ...uniqWhere,
//     username: msg.from.username,
//     status: 'here'
//   });
//
//   return bot.sendMessage(msg.chat.id, `${firstName}, добро пожаловать в игру. Осталось только дождаться...`);
// };

const runCommands = {
  finduser: pickRandomUser,
  adduser: registerNewUser,
  stat_user: (bot: TelegramBot) => (message: CleanedMessage) =>
    'show statistics',
  loser: (bot: TelegramBot) => (message: CleanedMessage) => 'find loser',
  stat_loser: (bot: TelegramBot) => (message: CleanedMessage) => 'stat losers',
};

const ACCEPTED_COMMANDS = Object.keys(
  runCommands
) as (keyof typeof runCommands)[];

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  console.log(msg);
  const messageIsCommand = (
    msg: TelegramBot.Message
  ): msg is typeof msg & {
    text: string;
  } => (msg.text || '')[0] === '/';
  if (!messageIsCommand(msg)) {
    console.log("Message isn'r command", msg);
    return;
  }

  const indexOfBotName = msg.text.indexOf(`@${BOT_NAME}`);
  const command = msg.text.substring(
    1,
    indexOfBotName === -1 ? undefined : indexOfBotName
  );
  const isCommandAccepted = (
    command: string
  ): command is (typeof ACCEPTED_COMMANDS)[number] =>
    ACCEPTED_COMMANDS.indexOf(command as (typeof ACCEPTED_COMMANDS)[number]) !==
    -1;
  if (!isCommandAccepted(command)) {
    console.log(`Command wasn't accepted: ${command}`);
    return;
  }
  const isFromHere = <T extends { from?: TelegramBot.User }>(
    m: T
  ): m is T & {
    from: TelegramBot.User;
  } => !!m.from;
  if (!isFromHere(msg)) {
    console.log("Doesn't have From field");
    return;
  }
  console.log('command accepted', command);
  runCommands[command](bot)(cleanMsgObj(msg));
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
