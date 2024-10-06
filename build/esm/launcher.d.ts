/// <reference types="node" />
import Handler from './handler';
import { Options } from './types';
export declare class Client {
    config: Options;
    handler: Handler;
    constructor(config: Options);
    launch(): void;
    install(): Promise<void>;
    start(): Promise<void | import("child_process").ChildProcessWithoutNullStreams>;
}
