import { AppError } from './errors.js';

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = this.getTimestamp();
    const metaString = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }

  public info(message: string, meta?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, meta));
  }

  public warn(message: string, meta?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  public error(error: Error | AppError | string, meta?: any): void {
    const errorObject = error instanceof Error ? error : new Error(error);
    const errorMeta = {
      ...meta,
      stack: errorObject.stack,
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        isOperational: error.isOperational,
      }),
    };
    
    console.error(this.formatMessage(LogLevel.ERROR, errorObject.message, errorMeta));
  }

  public debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }
}

export const logger = new Logger(); 