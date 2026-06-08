import type {ISkillTree} from "@/@types/skilltree"
import {resolveAssetUrl} from "@/libs/io/cdn"

/**
 * Baut die CSS-Eigenschaften für den optionalen Tree-Hintergrund.
 * Gibt undefined zurück, wenn kein Hintergrundbild gesetzt ist.
 */
export function treeBackgroundStyle(tree: ISkillTree): Record<string, string> | undefined {
  if (!tree.backgroundImage) return undefined

  const size = tree.backgroundSize || "cover"
  return {
    backgroundImage: `url('${resolveAssetUrl(tree.backgroundImage)}')`,
    backgroundSize: size === "tile" ? "auto" : size,
    backgroundRepeat: size === "tile" ? "repeat" : "no-repeat",
    backgroundPosition: tree.backgroundPosition || "center",
    opacity: String((tree.backgroundOpacity ?? 100) / 100),
  }
}
