import DataManager from "@/libs/data/data-manager";

export enum UpdateState {
    Initializing,
    Checking,
    Updating,
    LoadingData,
    LoadingCharacters,
    Finishing
}

export class Backend {

    public static async initAsync(): Promise<void> {
        if (process.env.NODE_ENV === 'development') {
            await DataManager.load();
        }
    }
}
