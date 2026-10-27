export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  level?: LogLevel;
  context?: string;
}

export class Logger {
  private level: LogLevel;
  private context?: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 'info';
    this.context = options.context;
  }

  debug(message: string, ...meta: unknown[]): void {
    if (this.shouldLog('debug')) {
      this.write('debug', message, meta);
    }
  }

  info(message: string, ...meta: unknown[]): void {
    if (this.shouldLog('info')) {
      this.write('info', message, meta);
    }
  }

  warn(message: string, ...meta: unknown[]): void {
    if (this.shouldLog('warn')) {
      this.write('warn', message, meta);
    }
  }

  error(message: string, ...meta: unknown[]): void {
    if (this.shouldLog('error')) {
      this.write('error', message, meta);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.level];
  }

  private write(level: LogLevel, message: string, meta: unknown[]): void {
    const timestamp = new Date().toISOString();
    const tag = this.context ? `[${this.context}]` : '';
    console.log(`${timestamp} [${level.toUpperCase()}] ${tag} ${message}`, ...meta);
  }
}
