import {getAttributeName, getSkillName} from "@/@types/models"
import {type ISkillModifier, ModifierOperator, ModifierTargetType} from "@/@types/skilltree"

export function charValueLabel(key: string): string {
  switch (key) {
    case "humanity": return "Menschlichkeit"
    case "hunger": return "Hunger"
    case "bloodPotency": return "Blutmacht"
    case "health": return "Gesundheit"
    case "willpower": return "Willenskraft"
    case "stains": return "Makel"
    case "generation": return "Generation"
    default: return key
  }
}

export function modifierTargetLabel(mod: ISkillModifier): string {
  switch (mod.target) {
    case ModifierTargetType.Attribute:
      return getAttributeName(mod.key)
    case ModifierTargetType.Skill:
      return getSkillName(mod.key)
    case ModifierTargetType.CharacterValue:
      return charValueLabel(mod.key)
    default:
      return mod.key
  }
}

/** Menschlich lesbare Beschreibung eines Modifikators, z.B. "+1 Stärke". */
export function formatModifier(mod: ISkillModifier): string {
  const t = modifierTargetLabel(mod)
  switch (mod.operator) {
    case ModifierOperator.Add: return `+${mod.value} ${t}`
    case ModifierOperator.Subtract: return `−${mod.value} ${t}`
    case ModifierOperator.Multiply: return `${t} ×${mod.value}`
    case ModifierOperator.Divide: return `${t} ÷${mod.value}`
    case ModifierOperator.Set: return `${t} = ${mod.value}`
    case ModifierOperator.Lock: return `${t} gesperrt auf ${mod.value}`
    case ModifierOperator.Min: return `${t} mindestens ${mod.value}`
    case ModifierOperator.Max: return `${t} höchstens ${mod.value}`
    default: return `${t} ${mod.value}`
  }
}
