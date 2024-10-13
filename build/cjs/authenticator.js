"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offline = void 0;
const uuid_1 = require("uuid");
const offline = (username) => {
    const uuid = (0, uuid_1.v3)(username, uuid_1.v3.DNS);
    return { access_token: uuid, client_token: uuid, uuid, name: username };
};
exports.offline = offline;
