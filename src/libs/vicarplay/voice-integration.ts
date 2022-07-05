import {IClientIdenity} from "@/libs/vicarplay/types";

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

export class VoiceIntegration {

    private currentSession: string|null = null;

    public constructor(public data: IVoiceIntegrationData) {

    }

    public async start(): Promise<void> {

    }

    public async stop(): Promise<void> {

    }

    public async movePlayer(player: IClientIdenity, toPrivate: boolean): Promise<void> {

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
