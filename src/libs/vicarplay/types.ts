import Peer from "peerjs";
import {IVoiceIntegrationData} from "@/libs/vicarplay/voice-integration";

export interface IOldSession {
    name: string;
    host: IPlayer;
    isHost: boolean;
    peer: Peer;
}

export interface IHostedSession extends IOldSession {
    players: IPlayer[];
    syncChars: SyncChars;
}

export interface IPlayer {
    name: string;
    tsName: string;
    dcName: string;
    id: string;
    isHost: boolean;
    isMain: boolean;
    isSyncLoading: boolean;
}

export interface IPacket {
    sender: IPlayer;
    name: string;
    payload: any[];
}

export type SyncChars = {[key: string]: string};

// ----------- NEW VERSION -----------

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

export interface ILastPlaySession {
    name: string;
    date: number;
    voiceData: IVoiceIntegrationData;
}

export interface IClientIdenity {
    socketId: string;
    username: string;
    tsName: string;
    discordName: string;
    isHost: boolean;

    isSyncLoading: boolean;
    syncingCharId: string|null;
}

export interface ISessionState {
    id: string;
    name: string;
    host: IClientIdenity;
    chatHistory: IMessage[];
    players: IClientIdenity[];
}

export interface IMessage {
    type: MessageType;
    content: any;
    sender: IClientIdenity;
    receiver?: IClientIdenity;
}
