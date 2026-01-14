import {type IRestriction, RestrictionType} from "@/@types/data";
import {type ICharacter} from "@/@types/models";

type ResolverCallback = (char: ICharacter, data: any) => boolean;
const registeredResolvers: { [type: string]: ResolverCallback } = {};

class RestrictionResolver {

  constructor() {
    registeredResolvers[RestrictionType.SpecificClans] = this.resolveSpecificClans.bind(this);
    registeredResolvers[RestrictionType.ExcludeClans] = this.resolveExcludeClans.bind(this);
    registeredResolvers[RestrictionType.MinimumCharacterValue] = this.resolveMinimumCharacterValue.bind(this);
    registeredResolvers[RestrictionType.BookActivated] = this.resolveBookActivated.bind(this);
    registeredResolvers[RestrictionType.MaxGeneration] = this.resolveMaxGeneration.bind(this);
    registeredResolvers[RestrictionType.MaxBloodPotency] = this.resolveMaxBloodPotency.bind(this);
  }

  public resolve(char: ICharacter, restriction: IRestriction): boolean {
    if (registeredResolvers[restriction.type]) {
      return registeredResolvers[restriction.type]!(char, restriction.data);
    }
    return false;
  }

  private resolveSpecificClans(char: ICharacter, clanIds: number[]): boolean {
    return clanIds.includes(char.clan.id);
  }

  private resolveExcludeClans(char: ICharacter, clanIds: number[]): boolean {
    return !clanIds.includes(char.clan.id);
  }

  private resolveMinimumCharacterValue(char: ICharacter, data: { value: number, key: keyof ICharacter }): boolean {
    // @ts-ignore
    return char[data.key] >= data.value;
  }

  private resolveBookActivated(char: ICharacter, bookIds: number[]): boolean {
    return bookIds.some(bookId => char.books.includes(bookId));
  }

  private resolveMaxGeneration(char: ICharacter, generation: number): boolean {
    return char.generation <= generation;
  }

  private resolveMaxBloodPotency(char: ICharacter, bloodPotency: number): boolean {
    return char.bloodPotency <= bloodPotency;
  }
}

export const restrictionResolver = new RestrictionResolver();
