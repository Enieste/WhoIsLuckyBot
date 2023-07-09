import { CleanedMessage, Designation, LOSER, WINNER } from "../utils/types";
import TelegramBot from "node-telegram-bot-api";
import {addCustomChatSearchMessages} from "../db";

export const messageStringToArray = (str: string): string[] => {
  return str.split("|").map(s => s.trim());
};

async function* createMessageGenerator(
  messages: string[]
): AsyncGenerator<string> {
  for (const value of messages) {
    await new Promise (success => {
      setTimeout(() => {
        success('')
      }, 1000)
    })
    yield value;
  }
}

export const sendSearchMessages = async (bot :TelegramBot, chatId: TelegramBot.ChatId, messagesString: string) => {
  for await (const value of createMessageGenerator(messageStringToArray(messagesString))) {
    await bot.sendMessage(chatId, value);
  }
}

type ProperRight = 'creator' | 'administrator';
function doesHasRight(value: string): value is ProperRight {
  return ['creator', 'administrator'].includes(value);
}

let settingNewMessage = false;
const setMessage =
  (tag: Designation) =>
    (bot: TelegramBot) =>
      async (msg: CleanedMessage): Promise<void> => {
        if (settingNewMessage) return;
        settingNewMessage = true;
        const user = await bot.getChatMember(msg.chat.id, msg.from.id);
        if (!doesHasRight(user.status)) {
          await bot.sendMessage(msg.chat.id, 'Команда доступна только администраторам канала 🤓');
          return;
        }
        await addCustomChatSearchMessages({ chatId: msg.chat.id, tag, messagesString: msg.text as string });
        await bot.sendMessage(msg.chat.id, 'Понял. Принял 😀');
        settingNewMessage = false;
      };

export const setFindUserMessage = setMessage(WINNER);
export const setFindLoserMessage = setMessage(LOSER);