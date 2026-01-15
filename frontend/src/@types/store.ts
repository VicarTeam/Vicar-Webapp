import type {ICharacter, ICharacterDirectory} from "@/@types/models";
import type {IWerewolfW5Sheet} from "@/@types/w5";
import type {GameLine} from "@/@types/gameline.ts";

export interface State {
    editingCharacter?: ICharacter|IWerewolfW5Sheet;
    isLevelMode: boolean;
    directoryForCharCreation?: ICharacterDirectory;
    draggingCharacter?: ICharacter;
    overrideGameLine?: GameLine;
    lexiconOpen: boolean;
}
