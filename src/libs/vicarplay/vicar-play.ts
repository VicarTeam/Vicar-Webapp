import {IHostedSession, IPacket, IPlayer, ISession} from "@/libs/vicarplay/types";
import Peer, {DataConnection} from "peerjs";
//@ts-ignore
import {v4 as uuidv4} from 'uuid';
import EventBus from "@/libs/event-bus";
import {LevelType} from "@/types/models";

type ReceivePacketCallback = (sender: IPlayer, ...data: any[]) => number;
const registeredReceivers: {[key: string]: ReceivePacketCallback} = {};

let ackCallbacks: {[name: string]: Function} = {};

const ReceivePacket = (name: string) => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            registeredReceivers[name] = (char, data) => descriptor.value.call(target, char, ...data);
        }
    };
}

class VicarPlay {

    private _session: ISession|null;
    private _me: IPlayer|null;

    constructor() {
        this._session = null;
        this._me = null;
        EventBus.$on("closing", this.onAppClosing);
    }

    public createSession(username: string, name: string): Promise<ISession> {
        return new Promise<ISession>((resolve, reject) => {
            if (this.isRunning) {
                reject();
                return;
            }

            ackCallbacks = {};

            const peer = new Peer();
            peer.on("open", id => {
                this._me = {
                    id,
                    name: username
                };
                this._session = <IHostedSession>{
                    isHost: true, players: [],
                    host: this._me,
                    name, peer
                };

                resolve(this.session);
            });
            peer.on("error", e => {
               reject(e);
            });
            peer.on("connection", conn => {
                this.onPeerConnection(conn);
            });
        });
    }

    public connectToSession(username: string, hostId: string): Promise<ISession> {
        return new Promise<ISession>((resolve, reject) => {
            if (this.isRunning) {
                reject();
                return;
            }

            ackCallbacks = {};

            const peer = new Peer();
            peer.on("open", async id => {
                this._me = {
                    id,
                    name: username
                };

                this.sendToIdViaPeer(peer, hostId, "player:join", [
                    (host: IPlayer, name: string) => {
                        this._session = {
                            host, name, peer, isHost: false
                        };

                        resolve(this.session);
                    }
                ]);
            });
            peer.on("error", e => {
                reject(e);
            });
            peer.on("connection", conn => {
                this.onPeerConnection(conn);
            });
        });
    }

    public get isRunning() {
        return this._session !== null && this._session.peer.open;
    }

    public get session(): ISession {
        return this._session!;
    }

    public close(): Promise<void> {
        return new Promise<void>(resolve => {
            if (!this.isRunning) {
                resolve();
                return;
            }

            if (this.session.isHost) {
                this.broadcast("session:closed");
            } else {
                this.sendHost("player:left");
            }

            setTimeout(() => {
                this.session.peer.destroy();
                this._session = null;
                this._me = null;

                resolve();
            }, 1000);
        })
    }

    public sendHost(name: string, ...data: any[]) {
        if (!this.isRunning || this.session.isHost) {
            return;
        }

        this.sendTo(this.session.host, name, data);
    }

    public broadcast(name: string, ...data: any[]) {
        if (!this.isRunning || !this.session.isHost) {
            return;
        }

        const session = <IHostedSession>this.session;
        session.players.forEach(x => {
            this.sendTo(x, name, data)
        });
    }

    @ReceivePacket("player:join")
    private onPlayerJoinPacket(player: IPlayer, ack: (host: IPlayer, name: string) => void) {
        console.log(this);
        console.log(this.session);

        if (!this.session.isHost) {
            return;
        }

        (<IHostedSession>this.session).players.push(player);
        ack(this._me!, this.session.name);
    }

    @ReceivePacket("player:left")
    private onPlayerLeftPacket(player: IPlayer) {
        if (!this.session.isHost) {
            return;
        }

        const session = <IHostedSession>this.session;
        session.players = session.players.filter(x => x.id !== player.id);
    }

    private sendTo(other: IPlayer, name: string, payload: any[]) {
        if (!this.isRunning) {
            return;
        }

        this.sendToIdViaPeer(this.session.peer, other.id, name, payload);
    }

    private sendToIdViaPeer(peer: Peer, id: string, name: string, payload: any[]) {
        for (let i = 0; i < payload.length; i++) {
            const data = payload[i];

            if (typeof data === "function") {
                const aid = uuidv4();

                ackCallbacks[aid] = data;
                payload[i] = "ack@" + aid;
            }
        }

        const conn = peer.connect(id);
        conn.on("open", () => {
            conn.send(<IPacket>{
                sender: this._me!,
                name, payload
            });
        });
        conn.on("error", args => {
            console.log(args);
        });
    }

    private onPeerConnection(conn: DataConnection) {
        conn.on("data", data => {
            try {
                const packet = <IPacket>data;
                const payload: any[] = packet.payload;

                for (let i = 0; i < payload.length; i++) {
                    const data = payload[i];
                    if (typeof data === 'string' || data instanceof String) {
                        if (data.startsWith("ack@")) {
                            payload[i] = (...args: any[]) => this.sendTo(packet.sender, "!ack:back", [{
                                aid: data.split('@')[1],
                                args
                            }]);
                        }
                    }
                }

                if (registeredReceivers[packet.name]) {
                    registeredReceivers[packet.name](packet.sender, payload);
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    private async onAppClosing() {
        if (!this.isRunning) {
            return;
        }

        await this.broadcast("session:closed");
    }
}

export const vicarPlay = new VicarPlay();