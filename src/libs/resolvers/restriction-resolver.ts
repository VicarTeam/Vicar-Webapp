import {IRestriction, RestrictionType} from "@/types/data";
import {ICharacter} from "@/types/models";

type ResolverCallback = (char: ICharacter, data: any) => boolean;
const registeredResolvers: {[type: string]: ResolverCallback} = {};

const ResolveType = (type: RestrictionType) => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            registeredResolvers[type] = (char, data) => descriptor.value.call(target, char, data);
        }
    };
}

class RestrictionResolver {

    public resolve(char: ICharacter, restriction: IRestriction): boolean {
        if (registeredResolvers[restriction.type]) {
            return registeredResolvers[restriction.type](char, restriction.data);
        }
        return false;
    }

    @ResolveType(RestrictionType.SpecificClans)
    private resolveSpecificClans(char: ICharacter, clanIds: number[]): boolean {
        return clanIds.includes(char.clan.id);
    }

    @ResolveType(RestrictionType.ExcludeClans)
    private resolveExcludeClans(char: ICharacter, clanIds: number[]): boolean {
        return !clanIds.includes(char.clan.id);
    }

    @ResolveType(RestrictionType.MinimumCharacterValue)
    private resolveMinimumCharacterValue(char: ICharacter, data: {value: number, key: keyof ICharacter}): boolean {
        return char[data.key] >= data.value;
    }

    @ResolveType(RestrictionType.BookActivated)
    private resolveBookActivated(char: ICharacter, bookIds: number[]): boolean {
        return bookIds.some(bookId => char.books.includes(bookId));
    }

    @ResolveType(RestrictionType.MaxGeneration)
    private resolveMaxGeneration(char: ICharacter, generation: number): boolean {
        return char.generation <= generation;
    }

    @ResolveType(RestrictionType.MaxBloodPotency)
    private resolveMaxBloodPotency(char: ICharacter, bloodPotency: number): boolean {
        return char.bloodPotency <= bloodPotency;
    }
}

export const restrictionResolver = new RestrictionResolver();
