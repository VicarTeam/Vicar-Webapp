import {ICharacter, ICharacterDirectory} from "@/types/models";
import {IWerewolfW5Sheet} from "@/types/w5";

export interface State {
    editingCharacter?: ICharacter|IWerewolfW5Sheet;
    isLevelMode: boolean;
    directoryForCharCreation?: ICharacterDirectory;
    draggingCharacter?: ICharacter;
}
