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
        await DataManager.load();
    }
}
