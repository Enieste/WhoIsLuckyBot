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

const TELEGRAM_GROUP_CREATOR = 'creator' as const; // // from telegram api
const TELEGRAM_GROUP_ADMINISTRATOR = 'administrator' as const; // // from telegram api
const GROUPS_WITH_RIGHTS = [TELEGRAM_GROUP_CREATOR, TELEGRAM_GROUP_ADMINISTRATOR] as const;
type AcceptedPermission = typeof GROUPS_WITH_RIGHTS[number];

const hasPermissions = (s: TelegramBot.ChatMemberStatus): s is AcceptedPermission => GROUPS_WITH_RIGHTS.includes(s as AcceptedPermission)

let settingNewMessage = false;
const setMessage =
  (tag: Designation) =>
    (bot: TelegramBot) =>
      async (msg: CleanedMessage): Promise<void> => {
        if (settingNewMessage) return;
        settingNewMessage = true;
        const user = await bot.getChatMember(msg.chat.id, msg.from.id);
        if (!hasPermissions(user.status)) {
          await bot.sendMessage(msg.chat.id, 'Команда доступна только администраторам канала 🤓');
          settingNewMessage = false;
          return;
        }
        await addCustomChatSearchMessages({ chatId: msg.chat.id, tag, messagesString: msg.text as string });
        await bot.sendMessage(msg.chat.id, 'Понял. Принял 😀');
        settingNewMessage = false;
      };

export const setFindUserMessage = setMessage(WINNER);
export const setFindLoserMessage = setMessage(LOSER);