/// <reference types="node" />
import { ExecException } from 'node:child_process';
import { CustomArtifactType, CustomLibType, LibType, Options, Rule, Version } from './types';
import Counter from './utils/Counter';
declare class Handler {
    config: Options;
    counter: Counter;
    parsedVersion: Version;
    constructor(config: Options);
    checkJava(java: string): Promise<{
        run: boolean;
        message?: ExecException;
    }>;
    downloadAsync(url: string, directory: string, name: string, retry: boolean, type: string): Promise<{
        failed: boolean;
        asset: null;
    } | undefined>;
    getVersion(): Promise<Version>;
    getJar(): Promise<void>;
    getAssets(): Promise<void>;
    parseRule(lib: LibType): boolean;
    getNatives(): Promise<string>;
    fwAddArgs(): void;
    isModern(json: any): boolean;
    getForgedWrapped(): Promise<any>;
    downloadToDirectory(directory: string, libraries: LibType[] | CustomArtifactType[], eventName: string): Promise<string[]>;
    getClasses(classJson: CustomLibType): Promise<string[]>;
    processArguments(...args: (string | Rule | string[])[]): string[];
    getLaunchOptions(modification: CustomLibType | null): Promise<string[]>;
    getJVM(): Promise<string>;
    getMemory(): string[];
}
export default Handler;
