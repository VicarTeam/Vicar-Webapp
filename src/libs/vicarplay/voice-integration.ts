import {IPlayer} from "@/libs/vicarplay/types";
import axios, {Axios} from "axios";

export enum VoiceType {
    Discord = "dc", TeamSpeak = "ts"
}

export interface IVoiceIntegrationData {
    type: VoiceType;
    url: string;
    mainChannel: string;
    privateChannel: string;
    dcToken: string;
    dcGuild: string;
    tsHost: string;
    tsPort: number;
    tsQueryPort: number;
    tsUsername: string;
    tsPassword: string;
}

export class VoiceIntegration {

    private readonly axios: Axios|null = null;
    private currentSession: string|null = null;

    public constructor(public data: IVoiceIntegrationData) {
        this.axios = axios.create({
            baseURL: data.url + (data.url.endsWith("/") ? "" : "/")
        });
    }

    public async start(): Promise<void> {
        if (!this.axios) {
            return;
        }

        const res = (await this.axios.post<{session: string}>(`/session/${this.data.type}`, {
            dcToken: this.data.dcToken,
            dcGuild: this.data.dcGuild,
            tsHost: this.data.tsHost,
            tsPort: this.data.tsPort,
            tsQueryPort: this.data.tsQueryPort,
            tsUsername: this.data.tsUsername,
            tsPassword: this.data.tsPassword,
            mainChannel: this.data.mainChannel,
            privateChannel: this.data.privateChannel
        })).data;

        this.currentSession = res.session;
    }

    public async stop(): Promise<void> {
        if (!this.axios || !this.currentSession) {
            return;
        }

        await this.axios.delete(`/session/${this.currentSession}`);
    }

    public async movePlayer(player: IPlayer, toPrivate: boolean): Promise<void> {
        if (!this.axios || !this.currentSession) {
            return;
        }

        await this.axios.patch(`/session/${this.currentSession}/player/move`, {
            player: player, toPrivate
        });
    }
}

export const DefaultVoiceIntegration: () => IVoiceIntegrationData = () => {
    return {
        type: VoiceType.Discord,
        url: "",
        mainChannel: "",
        privateChannel: "",
        dcToken: "",
        dcGuild: "",
        tsHost: "",
        tsPort: 9987,
        tsQueryPort: 10011,
        tsUsername: "",
        tsPassword: ""
    };
};
