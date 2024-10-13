"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSum = exports.isLegacy = exports.getOS = exports.cleanUp = exports.popString = void 0;
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const log_1 = require("../utils/log");
const popString = (path) => path.split('/').slice(0, -1).join('/');
exports.popString = popString;
const cleanUp = (array) => [...new Set(Object.values(array).filter((value) => value !== null))];
exports.cleanUp = cleanUp;
const getOS = (os) => {
    if (os)
        return os;
    switch (process.platform) {
        case 'win32':
            return 'windows';
        case 'darwin':
            return 'osx';
        default:
            return 'linux';
    }
};
exports.getOS = getOS;
const checkSum = (hash, file) => new Promise((resolve, reject) => {
    (0, node_fs_1.stat)(file, (err, stat) => {
        if (err || !stat.isFile()) {
            (0, log_1.log)('debug', `Failed to check file due to ${err}`);
            return reject(err || new Error('Not a file'));
        }
        const hashStream = (0, node_crypto_1.createHash)('sha1');
        const fileStream = (0, node_fs_1.createReadStream)(file);
        hashStream.setEncoding('hex');
        fileStream.pipe(hashStream, { end: false });
        fileStream.on('end', () => {
            hashStream.end();
            resolve(hash === hashStream.read());
        });
    });
});
exports.checkSum = checkSum;
const isLegacy = (version) => version.assets === 'legacy' || version.assets === 'pre-1.6';
exports.isLegacy = isLegacy;
