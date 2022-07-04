import {ICharacter} from "@/types/models";
import {i18n} from "@/libs/i18n";
import {IMessage, MessageType} from "@/libs/vicarplay/types";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

type Usage = {
    key: string;
    names: string;
};

const usages: Usage[] = [];

type CommandCallback = (char: ICharacter|undefined, input: string) => [any, boolean?]|undefined;
const registeredCommands: {[type: string]: CommandCallback} = {};

const Command = (...names: string[]) => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            names.forEach(name => {
                registeredCommands[name.toLowerCase()] = (char, input) => descriptor.value.call(target, char, input);
            });
            usages.push({
                key: names[0],
                names: names.join(", ")
            });
        }
    };
}

const RollRegex = /(?<amount>[1-9]\d*)?[d|w](?<dice>[1-9]\d*)(?<bonus>[-|+][1-9]\d*)?/g

enum CheckStatus {
    CompleteFailure = "complete_failure",
    BestialFailure = "bestial_failure",
    CriticalTriumph = "critical_triumph",
    DirtyTriumph = "dirty_triumph",
    MinTriumph = "min_triumph",
    Triump = "triumph",
    Failure = "failure"
}

export class CommandHandler {

    public static uploadImage: ((cb: (img: string) => void) => void)|null = null;

    public handle(char: ICharacter|undefined, line: string): [any, boolean]|undefined {
        const parts = line.split("\n").join(" ").trim().split(" ");
        const command = parts[0].trim().toLowerCase();
        const input = parts.slice(1).join(" ");

        if (registeredCommands[command]) {
            const data = registeredCommands[command](char, input);
            if (!data) {
                return undefined;
            }

            if (data.length <= 0) {
                return undefined;
            }

            if (data.length === 1 || data[1] === undefined) {
                return [data[0], false];
            }

            return [data[0], data[1]!];
        }
        return undefined;
    }

    @Command("help", "h")
    public help(char: ICharacter|undefined, input: string): [any, boolean?]|undefined {
        const result: {resultType: string, messages: IMessage[]} = {
            resultType: "help",
            messages: []
        };
        usages.forEach(usage => {
            result.messages.push({
                content: "/[" + usage.names + "] " + i18n.t("play.chat.help." + usage.key),
                receiver: undefined!, sender: undefined!, type: MessageType.Raw
            });
        });
        return [result, true];
    }

    @Command("sroll", "sr")
    private secretRoll(char: ICharacter|undefined, input: string): [any, boolean?]|undefined {
        const data = this.roll(char, input);
        if (!data) {
            return undefined;
        }
        data[1] = true;
        return data;
    }

    @Command("roll", "r")
    private roll(char: ICharacter|undefined, input: string): [any, boolean?]|undefined {
        const match = RollRegex.exec(input.trim());
        if (!match) {
            return undefined;
        }

        let {amount, dice, bonus} = <{amount?: string; dice: string; bonus?: string}>match.groups;
        if (!amount) {
            amount = "1";
        }
        if (!bonus) {
            bonus = "0";
        }

        const amountInt = parseInt(amount);
        if (isNaN(amountInt)) {
            return undefined;
        }

        const diceInt = parseInt(dice);
        if (isNaN(diceInt)) {
            return undefined;
        }

        const bonusInt = parseInt(bonus);
        if (isNaN(bonusInt)) {
            return undefined;
        }

        let total = bonusInt;
        let rolls = [];
        for (let i = 0; i < amountInt; i++) {
            const roll = Math.floor(Math.random() * diceInt) + 1;
            rolls.push(roll);

            total += roll;
        }

        return [i18n.t("play.chat.rolled", {dice: input.trim(), roll: total + " (" + rolls.join(" ") + ")"})];
    }

    @Command("scheck", "sc")
    private secretCheck(char: ICharacter|undefined, input: string): [any, boolean?]|undefined {
        const data = this.check(char, input);
        if (!data) {
            return undefined;
        }
        data[1] = true;
        return data;
    }

    @Command("check", "c")
    private check(char: ICharacter|undefined, input: string): [any, boolean?]|undefined {
        const parts = input.split(" ").map(s => s.trim()).filter(part => part.length > 0);
        const isDuel = parts.length > 1;

        const supplies = parseInt(parts[0]);
        if (isNaN(supplies)) {
            return undefined;
        }

        const diff = isDuel ? parseInt(parts[1]) : -1;
        if (isDuel && isNaN(diff)) {
            return undefined;
        }

        const rolls = [];
        for (let i = 0; i < supplies; i++) {
            rolls.push(Math.floor(Math.random() * 10) + 1);
        }

        const successCount = rolls.reduce((acc, cur) => cur < 10 && cur >= 6 ? acc + 1 : acc, 0);
        const critCount = rolls.reduce((acc, cur) => cur === 10 ? acc + 1 : acc, 0);
        const critPairs = Math.floor(critCount / 2);
        const critRest = critCount % 2;
        const successes = critPairs * 4 + critRest + successCount;

        let status = (successCount + critCount) <= 0 ? CheckStatus.CompleteFailure : CheckStatus.Failure;
        if (isDuel) {
            if (successes >= diff) {
                if (critCount >= 1) {
                    status = CheckStatus.CriticalTriumph;
                } else {
                    status = CheckStatus.Triump;
                }
            }
        } else if (critCount >= 1) {
            status = CheckStatus.CriticalTriumph;
        } else if (successes >= 1) {
            status = CheckStatus.MinTriumph;
        }

        return [i18n.t("play.chat.check" + (isDuel ? ".against" : ""), {status: i18n.t("play.chat.check." + status), success: successes, rolls: rolls.join(" "), diff})];
    }

    @Command("shungercheck", "shunger", "shc", "sh")
    private secretHungerCheck(char: ICharacter|undefined, input: string): [any, boolean?]|undefined {
        const data = this.hungerCheck(char, input);
        if (!data) {
            return undefined;
        }
        data[1] = true;
        return data;
    }

    @Command("hungercheck", "hunger", "hc", "h")
    private hungerCheck(char: ICharacter|undefined, input: string): [any, boolean?]|undefined {
        if (!char) {
            return undefined;
        }

        const parts = input.split(" ").map(s => s.trim()).filter(part => part.length > 0);
        const isDuel = parts.length > 1;

        const supplies = parseInt(parts[0]);
        if (isNaN(supplies)) {
            return undefined;
        }

        const diff = isDuel ? parseInt(parts[1]) : -1;
        if (isDuel && isNaN(diff)) {
            return undefined;
        }

        const normalRolls = [];
        const normalSupplies = Math.max(supplies - char.hunger, 0);
        for (let i = 0; i < normalSupplies; i++) {
            normalRolls.push(Math.floor(Math.random() * 10) + 1);
        }

        const hungerRolls = [];
        const hungerSupplies = Math.max(supplies - normalSupplies, 0);
        for (let i = 0; i < hungerSupplies; i++) {
            hungerRolls.push(Math.floor(Math.random() * 10) + 1);
        }

        const hungerCritCount = hungerRolls.reduce((acc, cur) => cur === 10 ? acc + 1 : acc, 0);
        const hungerFailCount = hungerRolls.reduce((acc, cur) => cur === 1 ? acc + 1 : acc, 0);

        const successCount = [...normalRolls, ...hungerRolls].reduce((acc, cur) => cur < 10 && cur >= 6 ? acc + 1 : acc, 0);
        const critCount = [...normalRolls, ...hungerRolls].reduce((acc, cur) => cur === 10 ? acc + 1 : acc, 0);
        const critPairs = Math.floor(critCount / 2);
        const critRest = critCount % 2;
        const successes = critPairs * 4 + critRest + successCount;

        let status = (successCount + critCount) <= 0 ? CheckStatus.CompleteFailure : CheckStatus.Failure;
        if (isDuel) {
            if (successes >= diff) {
                if (critCount >= 1) {
                    status = hungerCritCount >= 1 ? CheckStatus.DirtyTriumph : CheckStatus.CriticalTriumph;
                } else {
                    status = CheckStatus.Triump;
                }
            } else if (hungerFailCount >= 1) {
                status = CheckStatus.BestialFailure;
            }
        } else if (critCount >= 1) {
            status = hungerCritCount >= 1 ? CheckStatus.DirtyTriumph : CheckStatus.CriticalTriumph;
        } else if (successes >= 1) {
            status = CheckStatus.MinTriumph;
        }

        return [{
            resultType: "hungercheck",
            status: i18n.t("play.chat.check." + status),
            success: successes,
            rolls: normalRolls.join(" ") + (normalRolls.length >= 1 && hungerRolls.length >= 1 ? ' ' : ''),
            hunger: hungerRolls.join(" "),
            diff, isDuel
        }];
    }

    @Command("image", "img", "i")
    private image(char: ICharacter|undefined, input: string) {
        const send = (img: string) => {
            const receiver = VicarPlayClient.getChatReceiver();
            VicarPlayClient.sendChatMessage({
                type: VicarPlayClient.chatSendTo === "@all" ? MessageType.BroadcastAvatar : MessageType.PrivateAvatar,
                content: img,
                sender: VicarPlayClient.me!,
                receiver
            });
        };

        if (!input || input.trim().length <= 0) {
            if (CommandHandler.uploadImage) {
                CommandHandler.uploadImage(send);
            }
        } else {
            send(input);
        }
    }
}

export const commandHandler = new CommandHandler();
