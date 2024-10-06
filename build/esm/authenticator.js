import { v3 } from 'uuid';
export const offline = (username) => {
    const uuid = v3(username, v3.DNS);
    return { access_token: uuid, client_token: uuid, uuid, name: username };
};
