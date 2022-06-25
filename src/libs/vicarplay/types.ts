import Peer from "peerjs";

export enum MessageType {
    BroadcastMessage,
    PrivateMessage,
    BroadcastCommand,
    PrivateCommand,
    SecretCommand,
    BroadcastAvatar,
    PrivateAvatar,
    Status,
    Raw
}

export interface IMessage {
    type: MessageType;
    content: any;
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
