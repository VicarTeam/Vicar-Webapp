import {ICharacter} from "@/types/models";
import {IPTAction, ITraitPack, PTActionType} from "@/types/data";
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
        }
    }

    private static addTrait(char: ICharacter, pack: ITraitPack, levelId: number, name: "backgrounds" | "merits" | "flaws", packKey: "advantages" | "disadvantages" = "advantages"): void {
        let upack = char[name].packs.find(up => up.pack.id === pack.id);
        if (!upack) {
            upack = {
                pack,
                usedPoints: 0,
                traits: []
            };
            char[name].packs.push(upack);
        }

        const level = pack[packKey].find(adv => adv.id === levelId);
        if (level) {
            upack.traits.push({
                ...level,
                isLocked: true
            });
        }
    }
}
