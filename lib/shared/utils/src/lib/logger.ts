/* eslint-disable no-console -- this is the logger, I'm the captain now */
const formatMessage = (level: string, message: string): string => {
  const timestamp = new Date().toISOString();
  const machinePrefix = getMachinePrefix(level);
  return `[${timestamp}] ${machinePrefix} ${message}`;
};

const getMachinePrefix = (level: string): string => {
  switch (level) {
    case 'info':
      return '+++ COGITATOR LOG: ';
    case 'warn':
      return '+++ WARNING: MACHINE SPIRIT DISTURBANCE: ';
    case 'error':
      return '!!! ERROR: OMNISSIAH FORBID !!! ';
    case 'debug':
      return '>>> DEBUG: RUNNING SACRED DIAGNOSTIC: ';
    default:
      return '+++ LOG: ';
  }
};

const getColor = (level: string): string => {
  switch (level) {
    case 'info':
      return '\x1b[32m'; // Green
    case 'warn':
      return '\x1b[33m'; // Yellow
    case 'error':
      return '\x1b[31m'; // Red
    case 'debug':
      return '\x1b[34m'; // Blue
    default:
      return '\x1b[0m'; // Reset
  }
};

const resetColor = '\x1b[0m';

export const Logger = {
  info: (message: string): void => {
    console.log(getColor('info') + formatMessage('info', message) + resetColor);
  },
  warn: (message: string): void => {
    console.warn(
      getColor('warn') + formatMessage('warn', message) + resetColor,
    );
  },
  error: (message: string): void => {
    console.error(
      getColor('error') + formatMessage('error', message) + resetColor,
    );
  },
  debug: (message: string): void => {
    console.debug(
      getColor('debug') + formatMessage('debug', message) + resetColor,
    );
  },
};
