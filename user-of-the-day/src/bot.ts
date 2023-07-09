import TelegramBot from 'node-telegram-bot-api';
import pick from 'lodash/pick';
import { CleanedMessage, ValidMessage } from './utils/types';
import { registerNewUser } from './commands/addUser';
import { getLoser, getWinner } from './commands/pickRandomUser';
import { showStats } from './commands/showStats';
import { setFindLoserMessage, setFindUserMessage } from './commands/setMessage';
import { sendAllCommands } from './commands/sendAllCommands';

const token = process.env.TOKEN;

if (!token) throw new Error('no process.env.TOKEN');

const cleanMsgObj = (msg: ValidMessage): CleanedMessage =>
  pick(msg, ['from', 'chat', 'date', 'text'] as const);

const BOT_NAME =  process.env.BOT_NAME;

export const bot = new TelegramBot(token, { polling: true });

const runCommands = {
  finduser: getWinner,
  findbestuser: getLoser,
  adduser: registerNewUser,
  stats: showStats,
  setFindUserMessage: setFindUserMessage,
  setFindBestUserMessage:setFindLoserMessage,
  help: sendAllCommands,
};

const ACCEPTED_COMMANDS = Object.keys(
  runCommands
) as (keyof typeof runCommands)[];

export const parseMessage = (text: string): { command: string, messageAfterCommand: string } => {
  const indexOfBotName = text.indexOf(`@${BOT_NAME}`);
  const indexOfExtraText = text.indexOf(' ');
  // cutting command from /command@botname or /command" "with extra text
  const command = text.substring(
    1,
    indexOfBotName === -1 ? (indexOfExtraText !== -1 ? indexOfExtraText : undefined) : indexOfBotName
  );
  const messageAfterCommand = indexOfExtraText !== -1 ? text.substring(indexOfExtraText).trim() : '';
  return { command, messageAfterCommand }
};

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
    console.log("Message isn't command", msg);
    return;
  }
  const { command, messageAfterCommand } = parseMessage(msg.text);
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
  runCommands[command](bot)(cleanMsgObj({ ...msg, text: messageAfterCommand }));
});
