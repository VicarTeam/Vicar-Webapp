import {ICharacter, ILockableTrait} from "@/types/models";
import {IFlawChoice, IPTAction, ITraitPack, PTActionType} from "@/types/data";
import DataManager from "@/libs/data-manager";

export default class PTActionHandler {

    public static handle(char: ICharacter, action: IPTAction): void {
        switch (action.type) {
            case PTActionType.HumanityChange:
                char.humanity += action.data.amount;
                break;
            case PTActionType.BloodPotencyChange:
                char.bloodPotency += action.data.amount;
                break;
            case PTActionType.AddMerit:
                const merit = DataManager.getMerit(action.data.meritId);
                if (merit) {
                    this.addTrait(char, merit, action.data.levelId, "merits");
                }
                break;
            case PTActionType.AddBackground:
                const background = DataManager.getBackground(action.data.backgroundId);
                if (background) {
                    this.addTrait(char, background, action.data.levelId, "backgrounds");
                }
                break;
            case PTActionType.AddFlaw:
                const choices: IFlawChoice[] = action.data.choices;
                if (choices.length > 0) {
                    const choice = choices[0];
                    this.addFlaw(char, choice);
                }
                break;
            case PTActionType.AddBackgroundPoints:
                const background2 = DataManager.getBackground(action.data.backgroundId);
                if (background2) {
                    const upack = this.initializeTraitPack(char, background2, "backgrounds");
                    upack.bonusPoints += action.data.amount;
                }
                break;
        }
    }

    public static addFlaw(char: ICharacter, choice: IFlawChoice): void {
        const pack: ITraitPack|null = DataManager.getFlawOwner(choice);
        if (pack) {
            this.addTrait(char, pack, choice.flawId, "flaws", "disadvantages", (flaw: ILockableTrait) => {
                return {
                    ...flaw,
                    customLevel: choice.customLevel,
                    suffix: choice.suffix
                };
            });
        }
    }

    public static initializeTraitPack(char: ICharacter, pack: ITraitPack, name: "backgrounds" | "merits" | "flaws") {
        let upack = char[name].packs.find(up => up.pack.id === pack.id);
        if (!upack) {
            upack = {
                pack,
                usedPoints: 0,
                bonusPoints: 0,
                flawBonusPoints: 0,
                traits: []
            };
            char[name].packs.push(upack);
        }
        return upack;
    }

    private static addTrait(char: ICharacter, pack: ITraitPack, levelId: number, name: "backgrounds" | "merits" | "flaws", packKey: "advantages" | "disadvantages" = "advantages", cb: ((trait: ILockableTrait) => ILockableTrait)|null = null): void {
        const upack = this.initializeTraitPack(char, pack, name);

        const level = pack[packKey].find(adv => adv.id === levelId);
        if (level) {
            const trait = cb ? cb({
                ...level,
                isLocked: true
            }) : {
                ...level,
                isLocked: true
            };
            upack.traits.push(trait);
        }
    }
}
