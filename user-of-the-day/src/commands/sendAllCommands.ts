import TelegramBot from 'node-telegram-bot-api';
import { CleanedMessage } from '../utils/types';

const opts: TelegramBot.SendMessageOptions = {
  parse_mode: 'Markdown',
};

const loserTitle = process.env.LOSER_TITLE || 'неудачник';
export const sendAllCommands =
  (bot: TelegramBot) =>
  async (msg: CleanedMessage): Promise<void> => {
    await bot.sendMessage(
      msg.chat.id,
      `Доступные комманды:
😽 *finduser* - найти котика дня
🌈 *findbestuser* - найти ${loserTitle}а дня
➕ *adduser* - чтобы участвовать
🧐 *setFindUserMessage* - [ADMINS ONLY] Установить сообщения для поиска. Формат: /setFindUserMessage Сообщение1 | Сообщение2 | и тд.
🧐 *setFindBestUserMessage* - [ADMINS ONLY] Установить сообщения для поиска. Формат: /setFindUserMessage Сообщение1 | Сообщение2 | и тд.
📊 *stats* - статистика участников
🆘 *help* - показать все команды`,
      opts
    );
  };
