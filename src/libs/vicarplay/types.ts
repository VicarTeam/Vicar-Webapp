import Peer from "peerjs";
import {IVoiceIntegrationData} from "@/libs/vicarplay/voice-integration";

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
    tsName: string;
    dcName: string;
    id: string;
    isHost: boolean;
    isMain: boolean;
}

export interface IPacket {
    sender: IPlayer;
    name: string;
    payload: any[];
}

export interface ILastPlaySession {
    name: string;
    date: number;
    voiceData: IVoiceIntegrationData;
}
