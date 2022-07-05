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
