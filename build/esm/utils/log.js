import EventEmitter from 'node:events';
const eventEmitter = new EventEmitter();
const log = (type, message) => {
    const msg = typeof message === 'object' ? JSON.stringify(message) : message;
    eventEmitter.emit(type, type !== 'data' ? `[MCLC]: ${msg}` : msg);
    return;
};
const onLog = (type, callback) => {
    eventEmitter.on(type, callback);
    return;
};
export { log, onLog };
