import DataManager from "@/libs/data-manager";

export enum UpdateState {
    Initializing,
    Checking,
    Updating,
    LoadingData,
    Finishing
}

export class Backend {

    public static dataPath: string = "";
    public static charsPath: string = "";

    public static async initAsync(): Promise<void> {
        if (process.env.NODE_ENV === 'development') {
            await DataManager.load();
        }
    }

    public static updateData(event: (state: UpdateState) => void) {
        //TODO change
    }

    public static joinPathAsync(...paths: string[]): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!backend) {
                reject();
                return;
            }

            backend.joinPath(JSON.stringify(paths), path => {
                resolve(path);
            });
        });
    }

    public static getFoldersAsync(path: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if (typeof backend == "undefined") {
                reject();
                return;
            }

            backend.getFolders(path, json => {
                const folders: string[] = JSON.parse(json);

                if (folders) {
                    resolve(folders);
                } else {
                    reject();
                }
            });
        });
    }

    public static existsFileAsync(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (typeof backend == "undefined") {
                reject();
                return;
            }

            backend.existsFile(path, exists => {
               resolve(exists);
            });
        });
    }

    public static writeFileAsync(path: string, content: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
             if (typeof backend == "undefined") {
                 reject();
                 return;
             }

             backend.saveFile(path, content, success => {
                 (success ? resolve : reject)();
             });
        });
    }

    public static readFileAsync(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (typeof backend == "undefined") {
                reject();
                return;
            }

            backend.readFile(path, content => {
                if (content) {
                    resolve(content);
                } else {
                    reject();
                }
            });
        });
    }

    public static isPackagedAsync(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (typeof backend == "undefined") {
                reject();
                return;
            }

            backend.isPackaged(resolve);
        });
    }

    private static getPathsAsync(): Promise<{data: string, chars: string}> {
        return new Promise<{data: string; chars: string}>(resolve => {
            if (typeof backend == "undefined") {
                resolve({data: "", chars: ""});
                return;
            }

            backend.getPaths((dataPath, charsPath) => {
                resolve({
                    data: dataPath,
                    chars: charsPath
                });
            });
        });
    }
}
