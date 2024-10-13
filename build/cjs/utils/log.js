"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onLog = exports.log = void 0;
const node_events_1 = __importDefault(require("node:events"));
const eventEmitter = new node_events_1.default();
const log = (type, message) => {
    const msg = typeof message === 'object' ? JSON.stringify(message) : message;
    eventEmitter.emit(type, type !== 'data' ? `[MCLC]: ${msg}` : msg);
    return;
};
exports.log = log;
const onLog = (type, callback) => {
    eventEmitter.on(type, callback);
    return;
};
exports.onLog = onLog;
