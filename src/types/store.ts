import {ICharacter, ICharacterDirectory} from "@/types/models";

export interface State {
    editingCharacter?: ICharacter;
    editorCharHistory: ICharacter[];
    isLevelMode: boolean;
    directoryForCharCreation?: ICharacterDirectory;
    draggingCharacter?: ICharacter;
}
