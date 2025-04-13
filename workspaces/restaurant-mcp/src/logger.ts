import * as c from "picocolors";

type LoggerLevel = "silent" | "warn";

class Logger {
  private level?: LoggerLevel;

  setLevel(level: LoggerLevel): void {
    this.level = level;
  }

  info(...args: unknown[]): void {
    if (this.level === "silent") return;
    console.error(c.cyan("INFO"), ...args);
  }

  warn(...args: unknown[]): void {
    if (this.level === "silent") return;
    console.error(c.yellow("WARN"), ...args);
  }
}

export const logger: Logger = new Logger();
