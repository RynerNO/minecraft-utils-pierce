"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const authenticator_1 = require("./authenticator");
const handler_1 = __importDefault(require("./handler"));
const mclc_1 = __importDefault(require("./mclc"));
const utils_1 = require("./utils");
const log_1 = require("./utils/log");
const initialConfig = {
    mclc_log: true,
    root: './minecraft',
    directory: '',
    authorization: (0, authenticator_1.offline)('Steve'),
    detached: true,
    version: {
        number: '1.14.4',
        type: 'release',
    },
    url: {
        meta: 'https://launchermeta.mojang.com',
        resource: 'https://resources.download.minecraft.net',
    },
    memory: {
        min: Math.pow(2, 9),
        max: Math.pow(2, 10),
    },
};
class Client {
    config;
    handler;
    constructor(config) {
        this.config = { ...initialConfig, ...config };
        this.config.directory = (0, node_path_1.join)(this.config.root, 'versions', this.config.version.custom || this.config.version.number);
        this.handler = new handler_1.default(this.config);
    }
    launch() {
        throw Error('This function is no longer used. In order to install Minecraft, use the install function. To start Minecraft, use the start function');
    }
    async install() {
        this.config.mclc_log && (0, log_1.log)('version', `MCLC version ${mclc_1.default}`);
        if (!(0, node_fs_1.existsSync)(this.config.root)) {
            (0, log_1.log)('debug', 'Attempting to create root folder');
            (0, node_fs_1.mkdirSync)(this.config.root);
        }
        if (this.config.gameDirectory) {
            this.config.gameDirectory = (0, node_path_1.resolve)(this.config.gameDirectory);
            if (!(0, node_fs_1.existsSync)(this.config.gameDirectory))
                (0, node_fs_1.mkdirSync)(this.config.gameDirectory, { recursive: true });
        }
        await this.handler.getVersion();
        const mcPath = this.config.minecraftJar ||
            (this.config.version.custom
                ? (0, node_path_1.join)(this.config.root, 'versions', this.config.version.custom, `${this.config.version.custom}.jar`)
                : (0, node_path_1.join)(this.config.directory, `${this.config.version.number}.jar`));
        await this.handler.getNatives();
        if (!(0, node_fs_1.existsSync)(mcPath)) {
            (0, log_1.log)('debug', 'Attempting to download Minecraft version jar');
            await this.handler.getJar();
        }
        let modifyJson = null;
        if (this.config.version.custom) {
            (0, log_1.log)('debug', 'Detected custom in options, setting custom version file');
            modifyJson = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)(this.config.root, 'versions', this.config.version.custom, `${this.config.version.custom}.json`), {
                encoding: 'utf8',
            }));
        }
        (0, utils_1.cleanUp)(await this.handler.getClasses(modifyJson));
        (0, log_1.log)('debug', 'Attempting to download assets');
        await this.handler.getAssets();
        (0, log_1.log)('debug', `Successfully installed Minecraft ${this.config.version.number}`);
        return;
    }
    async start() {
        this.config.mclc_log && (0, log_1.log)('version', `MCLC version ${mclc_1.default}`);
        const java = await this.handler.checkJava(this.config.javaPath || 'java');
        if (!java || !java.run) {
            (0, log_1.log)('debug', `Couldn't start Minecraft due to: ${java.message}`);
            return (0, log_1.log)('close', 1);
        }
        const versionFile = await this.handler.getVersion();
        const mcPath = this.config.minecraftJar ||
            (this.config.version.custom
                ? (0, node_path_1.join)(this.config.root, 'versions', this.config.version.custom, `${this.config.version.custom}.jar`)
                : (0, node_path_1.join)(this.config.directory, `${this.config.version.number}.jar`));
        const nativePath = await this.handler.getNatives();
        const args = [];
        let modifyJson = null;
        if (this.config.version.custom) {
            (0, log_1.log)('debug', 'Detected custom in options, setting custom version file');
            modifyJson = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)(this.config.root, 'versions', this.config.version.custom, `${this.config.version.custom}.json`), {
                encoding: 'utf8',
            }));
        }
        else if (this.config.forge) {
            this.config.forge = (0, node_path_1.resolve)(this.config.forge);
            (0, log_1.log)('debug', 'Detected Forge in options, getting dependencies');
            modifyJson = await this.handler.getForgedWrapped();
        }
        const jvm = [
            '-XX:-UseAdaptiveSizePolicy',
            '-XX:-OmitStackTraceInFastThrow',
            '-Dfml.ignorePatchDiscrepancies=true',
            '-Dfml.ignoreInvalidMinecraftCertificates=true',
            `-Djava.library.path=${(0, node_path_1.resolve)(nativePath)}`,
            `-Xmx${this.handler.getMemory()[0]}`,
            `-Xms${this.handler.getMemory()[1]}`,
        ];
        if ((0, utils_1.getOS)(this.config.os) === 'osx') {
            if (parseInt(versionFile.id.split('.')[1]) > 12)
                jvm.push(await this.handler.getJVM());
        }
        else
            jvm.push(await this.handler.getJVM());
        if (this.config.customArgs)
            jvm.concat(this.config.customArgs);
        if (this.config.logj4ConfigurationFile)
            jvm.push(`-Dlog4j.configurationFile=${(0, node_path_1.resolve)(this.config.logj4ConfigurationFile)}`);
        // https://help.minecraft.net/hc/en-us/articles/4416199399693-Security-Vulnerability-in-Minecraft-Java-Edition
        if (parseInt(versionFile.id.split('.')[1]) === 18 && !parseInt(versionFile.id.split('.')[2]))
            jvm.push('-Dlog4j2.formatMsgNoLookups=true');
        if (parseInt(versionFile.id.split('.')[1]) === 17)
            jvm.push('-Dlog4j2.formatMsgNoLookups=true');
        if (parseInt(versionFile.id.split('.')[1]) < 17) {
            if (!jvm.find((arg) => arg.includes('Dlog4j.configurationFile'))) {
                const configPath = (0, node_path_1.resolve)(this.config.root);
                const intVersion = parseInt(versionFile.id.split('.')[1]);
                if (intVersion >= 12) {
                    await this.handler.downloadAsync('https://launcher.mojang.com/v1/objects/02937d122c86ce73319ef9975b58896fc1b491d1/log4j2_112-116.xml', configPath, 'log4j2_112-116.xml', true, 'log4j');
                    jvm.push(`-Dlog4j.configurationFile=${(0, node_path_1.resolve)((0, node_path_1.join)(configPath, 'log4j2_112-116.xml'))}`);
                }
                else if (intVersion >= 7) {
                    await this.handler.downloadAsync('https://launcher.mojang.com/v1/objects/dd2b723346a8dcd48e7f4d245f6bf09e98db9696/log4j2_17-111.xml', configPath, 'log4j2_17-111.xml', true, 'log4j');
                    jvm.push(`-Dlog4j.configurationFile=${(0, node_path_1.resolve)((0, node_path_1.join)(configPath, 'log4j2_17-111.xml'))}`);
                }
            }
        }
        const classes = this.config.classes || (0, utils_1.cleanUp)(await this.handler.getClasses(modifyJson));
        const classPaths = ['-cp'];
        const separator = (0, utils_1.getOS)(this.config.os) === 'windows' ? ';' : ':';
        (0, log_1.log)('debug', `Using ${separator} to separate class paths`);
        // Handling launch arguments.
        const file = modifyJson || versionFile;
        // So mods like fabric work.
        const jar = (0, node_fs_1.existsSync)(mcPath)
            ? `${separator}${(0, node_path_1.resolve)(mcPath)}`
            : `${separator}${(0, node_path_1.resolve)((0, node_path_1.join)(this.config.directory, `${this.config.version.number}.jar`))}`;
        classPaths.push(`${this.config.forge ? `${this.config.forge}${separator}` : ''}${classes.join(separator)}${jar}`);
        classPaths.push(file.mainClass);
        const launchconfig = await this.handler.getLaunchOptions(modifyJson);
        const launchArguments = args.concat(jvm, classPaths, launchconfig);
        (0, log_1.log)('arguments', launchArguments);
        console.log('debug', `Launching with arguments ${launchArguments.join(' ')}`);
        const minecraft = (0, node_child_process_1.spawn)(this.config.javaPath ?? 'java', launchArguments, {
            detached: this.config.detached,
        });
        minecraft.stdout.on('data', (data) => (0, log_1.log)('data', data.toString('utf-8')));
        minecraft.stderr.on('data', (data) => (0, log_1.log)('data', data.toString('utf-8')));
        minecraft.on('close', (code) => code && (0, log_1.log)('close', code));
        return minecraft;
    }
}
exports.Client = Client;
