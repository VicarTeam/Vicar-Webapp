import {IHostedSession, IPacket, IPlayer, ISession} from "@/libs/vicarplay/types";
import Peer, {DataConnection} from "peerjs";
//@ts-ignore
import {v4 as uuidv4} from 'uuid';
import EventBus from "@/libs/event-bus";

type ReceivePacketCallback = (sender: IPlayer, ...data: any[]) => number;
const registeredReceivers: {[name: string]: ReceivePacketCallback} = {};
let ackCallbacks: {[name: string]: Function} = {};

const ReceivePacket = (name: string) => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            registeredReceivers[name] = (sender, data) => descriptor.value.call(target, sender, ...data);
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
            });
            peer.on("error", e => {
               reject(e);
            });
            peer.on("connection", this.onPeerConnection);
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
            peer.on("open", id => {
                this._me = {
                    id,
                    name: username
                };

                this.sendTo({name: "", id: hostId}, "player:join", [
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
            peer.on("connection", this.onPeerConnection);
        });
    }

    public get isRunning() {
        return this._session !== null && this._session.peer.open;
    }

    public get session(): ISession {
        return this._session!;
    }

    public async sendHost(name: string, ...data: any[]): Promise<void> {
        if (!this.isRunning || this.session.isHost) {
            return;
        }

        await this.sendTo(this.session.host, name, data);
    }

    public async broadcast(name: string, ...data: any[]): Promise<void> {
        if (!this.isRunning || !this.session.isHost) {
            return;
        }

        const promises: Promise<void>[] = [];
        const session = <IHostedSession>this.session;
        session.players.forEach(x => {
           promises.push(this.sendTo(x, name, data));
        });

        await Promise.all(promises);
    }

    @ReceivePacket("player:join")
    private onPlayerJoinPacket(player: IPlayer, ack: (host: IPlayer, name: string) => void) {
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

    private sendTo(other: IPlayer, name: string, payload: any[]): Promise<void> {
        return new Promise<void>(resolve => {
            if (!this.isRunning) {
                resolve();
                return;
            }

            for (let i = 0; i < payload.length; i++) {
                const data = payload[i];

                if (typeof data === "function") {
                    const aid = uuidv4();

                    ackCallbacks[aid] = data;
                    payload[i] = "ack@" + aid;
                }
            }

            const conn = this.session.peer.connect(other.id);
            conn.on("open", () => {
                conn.send(<IPacket>{
                    sender: this._me!,
                    name, payload
                });
                conn.close();
                resolve();
            });
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