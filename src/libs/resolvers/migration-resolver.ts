import {CurrentCharacterVersion, ICharacter} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";
import {RestrictionType} from "@/types/data";
import DataManager from "@/libs/data/data-manager";

type ResolverCallback = (char: ICharacter) => void;
const registeredResolvers: {[version: number]: ResolverCallback} = {};

const ResolveType = (version: number) => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            registeredResolvers[version] = char => descriptor.value.call(target, char);
        }
    };
}

class MigrationResolver {

    public migrate(char: ICharacter) {
        const currentVersion = char["version"] || 0;
        for (let i = currentVersion; i < CurrentCharacterVersion; i++) {
            if (registeredResolvers[i]) {
                registeredResolvers[i](char);
            }
        }

        char.version = CurrentCharacterVersion;
        CharacterStorage.saveCharacter(char);
    }

    @ResolveType(0)
    private migrateVersion0(char: ICharacter) {
        for (const selection of char.disciplines) {
            const discipline = DataManager.getDiscipline(selection.discipline.id);
            if (discipline) {
                selection.discipline = discipline;
            }
        }
    }
}

export const migrationResolver = new MigrationResolver();
