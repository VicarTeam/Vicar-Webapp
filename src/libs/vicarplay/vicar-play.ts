import {Socket, io} from "socket.io-client";
import {SettingsData} from "@/libs/io/settings";
import {
    IClientIdenity,
    ILastPlaySession,
    IMessage,
    ISessionState
} from "@/libs/vicarplay/types";
import EventBus from "@/libs/event-bus";
import {ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";

class VicarPlay {

    public socket: Socket = null!;
    public sessionHistory: ILastPlaySession[] = [];

    public isMenuOpen = false;
    public chatSendTo: string = "@all";
    public syncingChar: ICharacter | null = null;

    public session: ISessionState | null = null;
    public me: IClientIdenity | null = null;

    public init() {
        this.sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');

        this.socket = io(SettingsData.getVicarPlayServer(), {
            reconnection: true
        });

        this.socket.on("session:joined", this.onSessionJoined);
        this.socket.on("session:closed", this.onSessionClosed);
        this.socket.on("chat:message", this.onChatMessage);
        this.socket.on("players:update", this.onPlayersUpdate);
        this.socket.on("sync-char:request", this.onSyncCharRequest);
        this.socket.on("sync-char:response", this.onSyncCharResponse);
        this.socket.on("sync-char:update", this.onSyncCharUpdate);
    }

    public isInSession(): boolean {
        return this.session !== null;
    }

    public amIHost(): boolean {
        return !!this.me && this.me.isHost;
    }

    public closeSession() {
        if (!this.session) {
            return;
        }

        if (this.amIHost()) {
            const sessionHistory = this.sessionHistory.find(x => x.name === this.session!.name);
            if (sessionHistory) {
                sessionHistory.date = Date.now();
            } else {
                this.sessionHistory.push({
                    name: this.session.name,
                    voiceData: null!,
                    date: Date.now()
                });
            }
        }

        this.socket.emit("session:close");
    }

    public kickPlayer(player: IClientIdenity) {
        this.socket.emit("players:kick", player);
    }

    public sendChatMessage(message: IMessage) {
        this.socket.emit("chat:message", message);
    }

    public getChatReceiver(): IClientIdenity | undefined {
        if (!this.session) {
            return undefined;
        }

        if (this.chatSendTo === "@all") {
            return undefined;
        }

        if (!this.amIHost()) {
            return this.session?.host;
        }

        return this.session.players.find(p => p.socketId === this.chatSendTo);
    }

    private onSessionJoined = (me: IClientIdenity, state: ISessionState) => {
        this.me = me;
        this.session = state;
    }

    private onSessionClosed = () => {
        this.isMenuOpen = false;
        this.session = null;
        this.me = null;
        this.syncingChar = null;
        this.chatSendTo = "@all";
    }

    private onChatMessage = (message: IMessage) => {
        if (!this.session) {
            return;
        }

        this.session.chatHistory.push(message);
    }

    private onPlayersUpdate = (mode: "add" | "remove", player: IClientIdenity) => {
        if (!this.session) {
            return;
        }

        if (mode === "add") {
            player["isSyncLoading"] = false;
            player["syncingCharId"] = null;

            this.session.players.push(player);
        } else {
            this.session.players = this.session.players.filter(x => x.socketId !== player.socketId);
        }
    }

    private onSyncCharRequest = (savingChar: string) => {
        EventBus.$emit("show-synccharplayermodal", savingChar);
    }

    private onSyncCharResponse = (targetSocketId: string, savingChar: string, char: ICharacter) => {
        if (!this.session) {
            return;
        }

        const player = this.session.players.find(x => x.socketId === targetSocketId);
        if (!player) {
            return;
        }

        if (savingChar === "@new") {
            CharacterStorage.addCharacter(char);
            player.syncingCharId = char.id;
        } else {
            const existingChar = CharacterStorage.loadedCharacters.find(x => x.id === savingChar);
            if (!existingChar) {
                return;
            }

            Object.entries(char).forEach(([key, value]) => {
                if (key === "id") {
                    return;
                }
                // @ts-ignore
                existingChar[key] = value;
            });
            CharacterStorage.saveCharacter(existingChar);
            player.syncingCharId = savingChar;
        }

        player.isSyncLoading = false;
    }

    private onSyncCharUpdate = (targetSocketId: string, char: ICharacter) => {
        if (!this.session) {
            return;
        }

        const player = this.session.players.find(x => x.socketId === targetSocketId);
        if (!player) {
            return;
        }

        const existingChar = CharacterStorage.loadedCharacters.find(x => x.id === player.syncingCharId);
        if (!existingChar) {
            return;
        }

        Object.entries(char).forEach(([key, value]) => {
                if (key === "id") {
                    return;
                }
                // @ts-ignore
                existingChar[key] = value;
            }
        );
        CharacterStorage.saveCharacter(existingChar);
    }
}

const VicarPlayClient = new VicarPlay();
export default VicarPlayClient;
