import TelegramBot from 'node-telegram-bot-api';
import { CleanedMessage } from '../utils/types';

const opts: TelegramBot.SendMessageOptions = {
  parse_mode: 'Markdown',
};

const BOT_NAME = process.env.BOT_NAME;

const loserTitle = process.env.LOSER_TITLE || 'неудачник';
export const sendAllCommands =
  (bot: TelegramBot) =>
  async (msg: CleanedMessage): Promise<void> => {
    await bot.sendMessage(
      msg.chat.id,
      `Доступные команды (после /):
😽 *finduser* - найти котика дня
🌈 *findbestuser* - найти ${loserTitle}а дня
➕ *adduser* - чтобы участвовать
🧐 *setFindUserMessage@${BOT_NAME}* - [ADMINS ONLY] Установить сообщения для поиска котика. После команды: Сообщение1 | Сообщение2 | и тд.
🧐 *setFindBestUserMessage@${BOT_NAME}* - [ADMINS ONLY] Установить сообщения для иного поиска. После команды: Сообщение1 | Сообщение2 | и тд.
📊 *stats* - статистика участников
🆘 *help* - показать все команды`,
      opts
    );
  };
