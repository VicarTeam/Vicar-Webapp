import {ICharacter} from "@/types/models";

export interface State {
    editingCharacter?: ICharacter;
    editorCharHistory: ICharacter[];
}
