import {IPlayer} from "@/libs/vicarplay/types";
import {Client, Guild, Intents} from "discord.js";

export enum VoiceType {
    Discord = "dc", TeamSpeak = "ts"
}

export interface IVoiceIntegrationData {
    type: VoiceType;
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

export abstract class VoiceIntegration {

    public constructor(public data: IVoiceIntegrationData) { }

    public abstract start(): Promise<void>;
    public abstract stop(): Promise<void>;
    public abstract movePlayer(player: IPlayer, toPrivate: boolean): Promise<void>;
}

export class TeamSpeakIntegration extends VoiceIntegration {

    async start(): Promise<void> {

    }

    async stop(): Promise<void> {

    }

    movePlayer(player: IPlayer, toPrivate: boolean): Promise<void> {
        return Promise.resolve(undefined);
    }

    private generateRandomString(): string {
        return Math.random().toString(36).substring(2, 8);
    }
}

export class DiscordIntegration extends VoiceIntegration {

    private client: Client|null = null;
    private guild: Guild|null = null;

    async start(): Promise<void> {
        this.client = new Client({intents: [Intents.FLAGS.GUILDS]});
        await this.client.login(this.data.dcToken);

        this.guild = await this.client.guilds.fetch(this.data.dcGuild);
        if (!this.guild) {
            await this.client.destroy();
            throw new Error("Could not find guild");
        }
    }

    stop(): Promise<void> {
        return Promise.resolve(undefined);
    }

    movePlayer(player: IPlayer, toPrivate: boolean): Promise<void> {
        return Promise.resolve(undefined);
    }
}

export const DefaultVoiceIntegration: () => IVoiceIntegrationData = () => {
    return {
        type: VoiceType.Discord,
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
