declare class BackendController {
    
    public getPaths(callback: (dataPath: string, charsPath: string) => void): void;
    
    public joinPath(paths: string, callback: (path: string) => void): void;
    
    public getFolders(path: string, callback: (json: string) => void): void;
    
    public existsFile(path: string, callback: (exists: boolean) => void): void;
    
    public updateData(callback: (state: number) => void): void;
    
    public saveFile(path: string, content: string, callback: (success: boolean) => void): void;
    
    public readFile(path: string, callback: (content: string|null) => void): void;
    
    public isPackaged(callback: (b: boolean) => void): void;
}

declare const backend = new BackendController();