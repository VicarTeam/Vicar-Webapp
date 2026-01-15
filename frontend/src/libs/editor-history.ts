import type { ICharacter } from "@/@types/models"

export class EditorHistory {
  private static _history: ICharacter[] = []
  private static _skipNextRestore = false

  public static push(character: ICharacter) {
    this._history.push(JSON.parse(JSON.stringify(character)))
  }

  public static pop(): ICharacter {
    return this._history.pop()!
  }

  public static clear() {
    this._history = []
    this._skipNextRestore = false
  }

  public static markSkipNextRestore() {
    this._skipNextRestore = true
  }

  public static shouldSkipRestore(): boolean {
    if (!this._skipNextRestore) return false
    this._skipNextRestore = false
    return true
  }

  public static get length() {
    return this._history.length
  }
}
