<script setup lang="ts">
import {ref} from "vue"
import {resolveAssetUrl, uploadImage} from "@/libs/io/cdn"

const model = defineModel<string>({default: ""})

const props = withDefaults(defineProps<{
  label?: string
  /** Runde Vorschau (z.B. für Icons). */
  rounded?: boolean
}>(), {
  label: "Bild hochladen",
  rounded: false,
})

const uploading = ref(false)
const error = ref("")

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ""
  if (!file) return

  error.value = ""
  uploading.value = true
  const url = await uploadImage(file)
  uploading.value = false

  if (url) model.value = url
  else error.value = "Upload fehlgeschlagen"
}

function clear() {
  model.value = ""
}
</script>

<template>
  <div class="image-upload">
    <div class="preview" :class="{rounded}">
      <img v-if="model" :src="resolveAssetUrl(model)" alt="" draggable="false"/>
      <i v-else class="fa-solid fa-image placeholder"></i>
      <div v-if="uploading" class="overlay"><i class="fa-solid fa-spinner fa-spin"></i></div>
    </div>

    <div class="actions">
      <label class="btn small">
        <i class="fa-solid fa-upload"></i> {{ label }}
        <input type="file" accept="image/*" hidden @change="onFile"/>
      </label>
      <button v-if="model" type="button" class="btn small danger" @click="clear">
        <i class="fa-solid fa-xmark"></i> Entfernen
      </button>
    </div>

    <small v-if="error" class="err">{{ error }}</small>
  </div>
</template>

<style scoped lang="scss">
.image-upload {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.preview {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-1);
  border: 1px solid color-mix(in srgb, var(--accent) 22%, rgba(255, 255, 255, 0.08));
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  &.rounded {
    border-radius: 999px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .placeholder {
    color: var(--text-3);
    font-size: 1.2rem;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    color: var(--text-1);
  }
}

.actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.btn.small {
  min-height: 2.4rem;
  padding: 0.35rem 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn.small.danger {
  color: color-mix(in srgb, #ff5a5a 85%, #ffffff);
  border-color: color-mix(in srgb, #ff5a5a 40%, transparent);
}

.err {
  color: color-mix(in srgb, #ff5a5a 80%, #ffffff);
  width: 100%;
}
</style>
