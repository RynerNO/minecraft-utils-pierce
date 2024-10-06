import { OS, Version } from '../types';
declare const popString: (path: string) => string;
declare const cleanUp: (array: string[]) => string[];
declare const getOS: (os?: OS) => OS;
declare const checkSum: (hash: string, file: string) => Promise<boolean>;
declare const isLegacy: (version: Version) => boolean;
export { popString, cleanUp, getOS, isLegacy, checkSum };
