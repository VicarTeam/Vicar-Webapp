import Peer from "peerjs";

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
}

export interface IPacket {
    sender: IPlayer;
    name: string;
    payload: any[];
}