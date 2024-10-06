declare const log: (type: string, message: string | number | Record<string, any>) => void;
declare const onLog: (type: string, callback: (message: string) => void) => void;
export { log, onLog };
