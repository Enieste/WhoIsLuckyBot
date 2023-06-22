import TelegramBot, {Message} from 'node-telegram-bot-api';
import pick from 'lodash/pick';
import has from 'lodash/has';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const token = process.env.TOKEN;

const cleanMsgObj = (msg) => {
  return pick(msg, ['from', 'chat', 'date']);
}

const BOT_NAME = 'WhoIsLuckyTodayBot';

const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
  const users = await prisma.user.findMany({});
  console.log('users', users);
  if (msg.text[0] !== '/') {
    return;
  }
  const indexOfBotName = msg.text.indexOf(`@${BOT_NAME}`);
  const command = msg.text.substring(1, indexOfBotName);
  if (!has(runCommands, command)) {
    return;
  }
  runCommands[command](cleanMsgObj(msg));
});

const pickRandomUser = (msg) => {
  bot.sendMessage(msg.chat.id, 'user');
};

const runCommands = {
  finduser: pickRandomUser,
  reg: registerNewUser,
  stat_user: 'show statistics',
  loser: 'find loser',
  stat_loser: 'stat losers'
};

const registerNewUser = async (msg: Message) => {
  const userId = msg.from.id;
  await prisma.UserChatStats.create({
    data: {
      userId: userId,
      chatId: 'Viola the Magnificent',
    },
  })
};

//const user = await prisma.user.findUnique({
//   where: {
//     id: 99,
//   },
// })

//const timePeriod = await prisma.timePeriod.findUnique({
//   where: {
//     year_quarter: {
//       quarter: 4,
//       year: 2020,
//     },
//   },
// })

//const users = await prisma.user.findMany()

