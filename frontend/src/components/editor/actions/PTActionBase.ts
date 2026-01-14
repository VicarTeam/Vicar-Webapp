import { onMounted } from "vue"
import type { ICharacter } from "@/@types/models"
import EventBus from "@/libs/event-bus"

export type PTActionExpose = {
  applyOutput: (char: ICharacter) => void
  isReady: () => boolean
}

export function usePTActionRegistration(expose: PTActionExpose) {
  onMounted(() => {
    EventBus.$emit("insert-ptaction", expose)
  })
}
