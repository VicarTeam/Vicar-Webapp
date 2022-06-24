import {IHostedSession, IPacket, IPlayer, ISession} from "@/libs/vicarplay/types";
import Peer, {DataConnection} from "peerjs";
//@ts-ignore
import {v4 as uuidv4} from 'uuid';
import EventBus from "@/libs/event-bus";

const RegisteredReceivers = Symbol('RegisteredReceivers');
let ackCallbacks: {[name: string]: Function} = {};

class ReceiverHandler {
    private static instance = new ReceiverHandler();
    private requestHandlers : {[name: string] : (sender: IPlayer, ...args: any[]) => ReceiverHandler} = {};

    private constructor() {}

    registerHandler(name: string, handler: (sender: IPlayer, ...args: any[]) => ReceiverHandler) {
        this.requestHandlers[name] = handler;
    }

    callHandler(name: string, other: IPlayer, data: any[]) {
        if (this.requestHandlers[name]) {
            return this.requestHandlers[name](other, ...data);
        }
    }

    static getInstance() {
        return this.instance;
    }
}

function ReceivePacket(name: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target[RegisteredReceivers] = target[RegisteredReceivers] || new Map();
        target[RegisteredReceivers].set(propertyKey, name);
    };
}

function Receiver<T extends { new(...args: any[]): {} }>(Base: T) {
    return class extends Base {
        constructor(...args: any[]) {
            super(...args);
            const subMethods = Base.prototype[RegisteredReceivers];
            if (subMethods) {
                subMethods.forEach((name: string, method: string) => {
                    ReceiverHandler.getInstance()
                        .registerHandler(
                            name,
                            (player, ...args: any[]) => (this as any)[method](player, ...args)
                        );
                });
            }
        }
    };
}

@Receiver
class VicarPlay {

    private _session: ISession|null;
    private _me: IPlayer|null;
    private _menuOpen: boolean = false;

    constructor() {
        this._session = null;
        this._me = null;
        EventBus.$on("closing", this.onAppClosing);
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

    @ReceivePacket("session:closed")
    private onSessionClosed() {
        if (this.session.isHost) {
            return;
        }

        this.session.peer.destroy();
        this._session = null;
        this._me = null;
        this._menuOpen = false;
    }

    public toggleMenu() {
        this._menuOpen = !this._menuOpen;
    }

    public isMenuOpen() {
        return this._menuOpen;
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
        this._menuOpen = false;
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

                if (packet.name === "!ack:back") {
                    const ackData: {aid: string, args: any[]} = payload[0];
                    if (ackCallbacks[ackData.aid]) {
                        ackCallbacks[ackData.aid].call(this, ...ackData.args);
                        delete ackCallbacks[ackData.aid];
                    }
                    return;
                }

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

                ReceiverHandler.getInstance().callHandler(packet.name, packet.sender, payload);
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