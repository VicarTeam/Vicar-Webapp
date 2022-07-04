import {
    IHostedSession,
    ILastPlaySession,
    IMessage,
    IPacket,
    IPlayer,
    IOldSession,
    MessageType, SyncChars
} from "@/libs/vicarplay/types";
import Peer, {DataConnection} from "peerjs";
//@ts-ignore
import {v4 as uuidv4} from 'uuid';
import EventBus from "@/libs/event-bus";
import {DefaultVoiceIntegration, IVoiceIntegrationData, VoiceIntegration} from "@/libs/vicarplay/voice-integration";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";

let ackCallbacks: {[name: string]: Function} = {};

class VicarPlayOld {

    public syncingChar: ICharacter|null = null;
    public chatSendTo: string = "@all";
    public voiceIntegrationData: IVoiceIntegrationData = null!;
    public voiceIntegration: VoiceIntegration|null = null;

    public readonly sessionHistory: ILastPlaySession[] = [];

    private _session: IOldSession|null;
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

    // TODO
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

    // TODO
    private onSyncCharRequest(player: IPlayer, ack: (char: ICharacter) => void) {
        if (this.session.isHost) {
            return;
        }

        EventBus.$emit("show-synccharplayermodal", ack);
    }

    // TODO
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

    public toggleMenu() {
        this._menuOpen = !this._menuOpen;
    }

    public isMenuOpen() {
        return this._menuOpen;
    }

    public getChatMessages() {
        return this._chat;
    }

    public get isRunning() {
        return this._session !== null && this._session.peer.open;
    }

    public get session(): IOldSession {
        return this._session!;
    }

    public get me(): IPlayer {
        return this._me!;
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
                        date: Date.now()
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

    private async onAppClosing() {
        if (!this.isRunning) {
            return;
        }

        await this.broadcast("session:closed");
    }
}

export const vicarPlay = new VicarPlayOld();
