import TelegramBot from 'node-telegram-bot-api';

// message with command
export type ValidMessage = Omit<TelegramBot.Message, 'from'> & {
  from: Exclude<TelegramBot.Message['from'], undefined>;
};
// no command and metadata anymore
export type CleanedMessage = Pick<ValidMessage, 'from' | 'chat' | 'date' | 'text'>;
export const LOSER = 'loser';
export const WINNER = 'winner';
export type Designation = typeof LOSER | typeof WINNER;
