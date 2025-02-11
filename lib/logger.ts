// Define a type for the context object
type LogContext = Record<string, unknown>;

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
}

class Logger {
  private static formatMessage(msg: LogMessage): string {
    const context = msg.context ? ` | ${JSON.stringify(msg.context)}` : "";
    return `[${msg.timestamp}] [${msg.level.toUpperCase()}] ${msg.message}${context}`;
  }

  static log(level: LogLevel, message: string, context?: LogContext) {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    const formattedMessage = this.formatMessage(logMessage);

    switch (level) {
      case "error":
        console.error(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "debug":
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  static info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  static error(message: string, error?: Error | unknown, context?: LogContext) {
    this.log("error", message, {
      ...context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              cause: error.cause,
            }
          : error,
    });
  }

  static warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  static debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }
}

export default Logger;
