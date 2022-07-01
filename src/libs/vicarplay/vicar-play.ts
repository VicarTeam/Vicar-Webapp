import {
    IHostedSession,
    ILastPlaySession,
    IMessage,
    IPacket,
    IPlayer,
    ISession,
    MessageType, SyncChars
} from "@/libs/vicarplay/types";
import Peer, {DataConnection} from "peerjs";
//@ts-ignore
import {v4 as uuidv4} from 'uuid';
import EventBus from "@/libs/event-bus";
import {DefaultVoiceIntegration, IVoiceIntegrationData, VoiceIntegration} from "@/libs/vicarplay/voice-integration";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";

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

    public syncingChar: ICharacter|null = null;
    public chatSendTo: string = "@all";
    public voiceIntegrationData: IVoiceIntegrationData = null!;
    public voiceIntegration: VoiceIntegration|null = null;

    public readonly sessionHistory: ILastPlaySession[] = [];

    private _session: ISession|null;
    private _me: IPlayer|null;
    private _menuOpen: boolean = false;
    private _chat: IMessage[] = [];
    private _keepAliveInterval: number|null = null;

    constructor() {
        this._session = null;
        this._me = null;
        this.sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
        EventBus.$on("closing", this.onAppClosing);
    }

    @ReceivePacket("keep-alive")
    private onKeepAlive(sender: IPlayer, ack: () => void) {
        ack();
    }

    @ReceivePacket("send:sync-char")
    private onSyncCharSend(player: IPlayer, char: ICharacter) {
        if (!this.session.isHost) {
            return;
        }

        const session = <IHostedSession>this.session;
        if (!session.syncChars[player.id]) {
            return;
        }

        const charId = session.syncChars[player.id];
        const existingChar = CharacterStorage.loadedCharacters.find(x => x.id === charId);
        if (!existingChar) {
            return;
        }

        Object.entries(char).forEach(([key, value]) => {
            if (key === 'id') {
                return;
            }

            //@ts-ignore
            existingChar[key] = value;
        });
    }

    @ReceivePacket("request:sync-char")
    private onSyncCharRequest(player: IPlayer, ack: (char: ICharacter) => void) {
        if (this.session.isHost) {
            return;
        }

        EventBus.$emit("show-synccharplayermodal", ack);
    }

    @ReceivePacket("player:join")
    private onPlayerJoinPacket(player: IPlayer, ack: (host: IPlayer, name: string) => void) {
        if (!this.session.isHost) {
            return;
        }

        (<IHostedSession>this.session).players.push(player);
        ack(this._me!, this.session.name);

        const message: IMessage = {
            type: MessageType.Status,
            sender: player,
            content: 'joined',
            isPrivate: false
        };
        this.sendChatMessage(message);
    }

    @ReceivePacket("player:left")
    private onPlayerLeftPacket(player: IPlayer) {
        if (!this.session.isHost) {
            return;
        }

        const session = <IHostedSession>this.session;
        session.players = session.players.filter(x => x.id !== player.id);
        delete session.syncChars[player.id];

        const message: IMessage = {
            type: MessageType.Status,
            sender: player,
            content: 'left',
            isPrivate: false
        };
        this.sendChatMessage(message);
    }

    @ReceivePacket("session:closed")
    private onSessionClosed() {
        if (this.session.isHost) {
            return;
        }

        if (this._keepAliveInterval) {
            clearInterval(this._keepAliveInterval);
            this._keepAliveInterval = null;
        }

        this.session.peer.destroy();
        this._session = null;
        this._me = null;
        this._menuOpen = false;
        this.chatSendTo = "@all";
    }

    @ReceivePacket("chat:player:message")
    private onPlayerChatMessage(sender: IPlayer, message: IMessage) {
        if (this.session.isHost) {
            return;
        }

        this._chat.push(message);
    }

    @ReceivePacket("chat:host:message")
    private onHostChatMessage(sender: IPlayer, message: IMessage) {
        if (!this.session.isHost) {
            return;
        }

        this._chat.push(message);
        if (!message.isPrivate) {
            this.broadcast("chat:player:message", message);
        }
    }

    public toggleMenu() {
        this._menuOpen = !this._menuOpen;
    }

    public isMenuOpen() {
        return this._menuOpen;
    }

    public getChatMessages() {
        return this._chat;
    }

    public getChatReceiver(): IPlayer|undefined {
        if (this.chatSendTo === "@all") {
            return undefined;
        }
        if (!this.session.isHost) {
            return this.session.host;
        }
        return (<IHostedSession>this.session).players.find(p => p.id === this.chatSendTo);
    }

    public sendChatMessage(message: IMessage, receiver?: IPlayer) {
        if (this.session.isHost) {
            this.getChatMessages().push(message);

            if (receiver !== undefined) {
                this.sendPlayer(receiver, "chat:player:message", message);
            } else {
                this.broadcast("chat:player:message", message);
            }
        } else {
            this.sendHost("chat:host:message", message);

            if (message.isPrivate) {
                this.getChatMessages().push(message);
            }
        }
    }

    public createSession(username: string, name: string, tsName: string, dcName: string, integrationData: IVoiceIntegrationData|null = null, copyId: boolean = false): Promise<ISession> {
        return new Promise<ISession>((resolve, reject) => {
            if (this.isRunning) {
                reject();
                return;
            }

            this.syncingChar = null;
            this.voiceIntegrationData = integrationData ?? DefaultVoiceIntegration();

            ackCallbacks = {};

            const peer = new Peer();
            peer.on("open", id => {
                this._chat = [];
                this._me = {
                    id,
                    dcName, tsName,
                    name: username,
                    isHost: true,
                    isMain: true,
                    isSyncLoading: false
                };
                this._session = <IHostedSession>{
                    isHost: true, players: [],
                    host: this._me,
                    name, peer,
                    syncChars: {}
                };

                this._keepAliveInterval = setInterval(() => {
                    const session = <IHostedSession>this.session;
                    [...session.players].forEach(x => {
                        const timeout = setTimeout(() => this.onPlayerLeftPacket(x), 4000);
                        this.sendTo(x, "keep-alive", [() => clearTimeout(timeout)]);
                    });
                }, 5000);

                if (copyId) {
                    navigator.clipboard.writeText(id).then(() => {
                        resolve(this.session);
                    });
                } else {
                    resolve(this.session);
                }
            });
            peer.on("error", e => {
               reject(e);
            });
            peer.on("connection", conn => {
                this.onPeerConnection(conn);
            });
        });
    }

    public connectToSession(username: string, hostId: string, tsName: string, dcName: string): Promise<ISession> {
        return new Promise<ISession>((resolve, reject) => {
            if (this.isRunning) {
                reject();
                return;
            }

            this.syncingChar = null;
            ackCallbacks = {};

            const peer = new Peer();
            peer.on("open", async id => {
                this._me = {
                    id,
                    dcName, tsName,
                    name: username,
                    isHost: false,
                    isMain: true,
                    isSyncLoading: false
                };

                this.sendToIdViaPeer(peer, hostId, "player:join", [
                    (host: IPlayer, name: string) => {
                        this._session = {
                            host, name, peer, isHost: false
                        };

                        resolve(this.session);
                    }
                ]);

                this._keepAliveInterval = setInterval(() => {
                    const timeout = setTimeout(() => this.onSessionClosed(), 4000);
                    this.sendHost("keep-alive", () => clearTimeout(timeout));
                }, 5000);
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

    public get me(): IPlayer {
        return this._me!;
    }

    public kickPlayer(player: IPlayer) {
        if (!this.session.isHost) {
            return;
        }

        const session = <IHostedSession>this.session;
        session.players = session.players.filter(x => x.id !== player.id);
        delete session.syncChars[player.id];
        this.sendTo(player, "session:closed", []);

        const message: IMessage = {
            type: MessageType.Status,
            sender: player,
            content: 'kicked',
            isPrivate: false
        };
        this.sendChatMessage(message);
    }

    public close(): Promise<void> {
        this._menuOpen = false;
        this.chatSendTo = "@all";
        return new Promise<void>(resolve => {
            if (!this.isRunning) {
                resolve();
                return;
            }

            if (this._keepAliveInterval) {
                clearInterval(this._keepAliveInterval);
                this._keepAliveInterval = null;
            }

            if (this.session.isHost) {

                const sessionHistory = this.sessionHistory.find(x => x.name === this.session.name);
                if (sessionHistory) {
                    sessionHistory.date = Date.now();
                } else {
                    this.sessionHistory.push({
                        name: this.session.name,
                        voiceData: this.voiceIntegrationData,
                        date: Date.now(),
                        syncChars: (<IHostedSession>this.session).syncChars
                    });
                }

                if (this.sessionHistory.length > 10) {
                    this.sessionHistory.shift();
                }

                localStorage.setItem("sessionHistory", JSON.stringify(this.sessionHistory));
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

    public sendPlayer(player: IPlayer, name: string, ...data: any[]) {
        if (!this.isRunning || !this.session.isHost) {
            return;
        }

        this.sendTo(player, name, data);
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
