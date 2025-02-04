/* eslint-disable no-console -- This is a logger */
interface LoggerType {
  logInfo: (message: string) => void;
  logWarning: (message: string) => void;
  logError: (message: string, errorMessage: string) => void;
}

export class Logger implements LoggerType {
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    const icon = this.determineIcon(level);
    return `[${timestamp}] ${icon} ${message}`;
  }

  private renderMessage(decorator: string, formattedMessage: string): void {
    console.log(`${decorator} ${formattedMessage}`);
  }

  private renderError(
    decorator: string,
    formattedMessage: string,
    errorMessage: string,
  ): void {
    console.error(`${decorator} ${formattedMessage}`, errorMessage);
  }

  private determineIcon(level: string): string {
    switch (level) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '💀';
      default:
        return '';
    }
  }

  logInfo(message: string): void {
    const formattedMessage = this.formatMessage('info', message);
    const decorator = '\x1b[32m> [INFO]\x1b[0m';
    this.renderMessage(decorator, formattedMessage);
  }

  logWarning(message: string): void {
    const formattedMessage = this.formatMessage('warning', message);
    const decorator = '\x1b[33m> [WARN]\x1b[0m';
    this.renderMessage(decorator, formattedMessage);
  }

  logError(message: string, errorMessage: string): void {
    const formattedMessage = this.formatMessage('error', message);
    const decorator = '\x1b[31m> [ERROR]\x1b[0m';
    this.renderError(decorator, formattedMessage, errorMessage);
  }
}
