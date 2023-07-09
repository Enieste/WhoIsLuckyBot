import { parseMessage } from '../bot';
const BOT_NAME = process.env.BOT_NAME;

describe('parseMessage', () => {
  it('should correctly parse the command and message after command', () => {
    const text = `/greet@${BOT_NAME} Hello, how are you?`;
    const expected = {
      command: 'greet',
      messageAfterCommand: 'Hello, how are you?',
    };

    const result = parseMessage(text);

    expect(result).toEqual(expected);
  });

  it('should correctly parse the command without message after command', () => {
    const text = `/help@${BOT_NAME}`;
    const expected = {
      command: 'help',
      messageAfterCommand: '',
    };

    const result = parseMessage(text);

    expect(result).toEqual(expected);
  });

  it('should correctly parse the command with extra spaces', () => {
    const text = `/command@${BOT_NAME}   Some extra text   `;
    const expected = {
      command: 'command',
      messageAfterCommand: 'Some extra text',
    };

    const result = parseMessage(text);

    expect(result).toEqual(expected);
  });

  it('should return an empty command and message when no text is provided', () => {
    const text = '';
    const expected = {
      command: '',
      messageAfterCommand: '',
    };

    const result = parseMessage(text);

    expect(result).toEqual(expected);
  });
});
