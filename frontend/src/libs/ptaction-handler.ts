import {ICharacter, ILockableTrait} from "@/types/models";
import {IFlawChoice, IPTAction, ITraitPack, PTActionType} from "@/types/data";
import DataManager from "@/libs/data/data-manager";

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
                    this.addTrait(false, false, char, merit, action.data.levelId, "merits");
                }
                break;
            case PTActionType.AddBackground:
                const background = DataManager.getBackground(action.data.backgroundId);
                if (background) {
                    this.addTrait(false, false, char, background, action.data.levelId, "backgrounds");
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
                const existingSpread = char.requiredPointSpreads.find(spread => spread.packId === action.data.backgroundId && spread.type === "backgrounds");
                if (existingSpread) {
                    existingSpread.points += action.data.amount;
                } else {
                    char.requiredPointSpreads.push({
                        isFlaw: false,
                        packId: action.data.backgroundId,
                        type: "backgrounds",
                        points: action.data.amount
                    });
                }
                break;
        }
    }

    public static addFlaw(char: ICharacter, choice: IFlawChoice, manual = false): void {
        const pack: ITraitPack|null = DataManager.getFlawOwner(choice);
        if (pack) {
            this.addTrait(manual, true, char, pack, choice.flawId, choice.type === "background" ? "backgrounds" : "merits", "disadvantages", (flaw: ILockableTrait) => {
                return {
                    ...flaw,
                    customLevel: choice.customLevel,
                    suffix: choice.suffix
                };
            });
        }
    }

    public static initializeTraitPack(char: ICharacter, pack: ITraitPack, name: "backgrounds" | "merits") {
        let upack = char[name].packs.find(up => up.pack.id === pack.id);
        if (!upack) {
            upack = {
                pack,
                traits: [],
                flawTraits: []
            };
            char[name].packs.push(upack);
        }
        return upack;
    }

    public static addTrait(manual: boolean, isFlaw: boolean, char: ICharacter, pack: ITraitPack, levelId: number, name: "backgrounds" | "merits", packKey: "advantages" | "disadvantages" = "advantages", cb: ((trait: ILockableTrait) => ILockableTrait)|null = null): void {
        const upack = this.initializeTraitPack(char, pack, name);

        const level = pack[packKey].find(adv => adv.id === levelId);
        if (level) {
            const trait = cb ? cb({
                ...level,
                isLocked: true,
                isManual: manual
            }) : {
                ...level,
                isLocked: true,
                isManual: manual
            };
            (isFlaw ? upack.flawTraits : upack.traits).push(trait);
        }
    }
}
