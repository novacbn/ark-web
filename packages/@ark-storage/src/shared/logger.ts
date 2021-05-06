export type ILoggerError = (err: Error, msg?: string, ...args: any[]) => void;

export type ILoggerLog = (obj?: object, msg?: string, ...args: any[]) => void;

export interface ILogger {
    error: ILoggerError;

    info: ILoggerLog;

    warn: ILoggerLog;
}
