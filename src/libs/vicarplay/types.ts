import Peer from "peerjs";

export enum MessageType {
    BroadcastMessage,
    PrivateMessage,
    BroadcastRoll,
    PrivateRoll,
    BroadcastAvatar,
    PrivateAvatar
}

export interface IMessage {
    type: MessageType;
    content: string;
    sender: IPlayer;
    isPrivate: boolean;
}

export interface ISession {
    name: string;
    host: IPlayer;
    isHost: boolean;
    peer: Peer;
}

export interface IHostedSession extends ISession {
    players: IPlayer[];
}

export interface IPlayer {
    name: string;
    id: string;
    isHost: boolean;
}

export interface IPacket {
    sender: IPlayer;
    name: string;
    payload: any[];
}
