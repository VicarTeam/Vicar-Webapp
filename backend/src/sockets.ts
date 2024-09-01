import {Socket} from "socket.io";

const socketMap = new Map<string, Socket>();

export function getSocket(userId: string): Socket|undefined {
    return socketMap.get(userId);
}

export function setSocket(userId: string, socket: Socket) {
    socketMap.set(userId, socket);
}

export function removeSocket(userId: string) {
    socketMap.delete(userId);
}