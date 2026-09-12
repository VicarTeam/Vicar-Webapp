<script setup lang="ts">
import { computed, provide, ref, watch } from "vue"
import { useStore } from "@/app/store"
import { Universe, getUniverseInfo, universes } from "@/@types/universe"
import { ensureLexiconUniverse, lexiconUniverse, setLexiconUniverse } from "@/components/main/lexicon/lexicon-universe"
import V5Lexicon from "@/components/main/lexicon/V5Lexicon.vue"
import DarkborneLexicon from "@/components/main/lexicon/DarkborneLexicon.vue"

const store = useStore()

const refsMap = ref<Record<string, HTMLElement | null>>({})
const navOpen = ref(false)

ensureLexiconUniverse(store.editingCharacter?.game)

const universe = computed(() => lexiconUniverse.value)
const universeInfo = computed(() => getUniverseInfo(universe.value))
const current = computed(() => (universe.value === Universe.Darkborne ? DarkborneLexicon : V5Lexicon))

function selectUniverse(id: Universe) {
  if (id === universe.value) return
  setLexiconUniverse(id)
}

function closeNav() {
  navOpen.value = false
}

function setRef(key: string) {
  return (el: any) => {
    if (!el) return
    if (refsMap.value[key]) return
    refsMap.value[key] = el as HTMLElement
  }
}

function goToParagraph(paragraph: string) {
  const el = refsMap.value[paragraph]
  el?.scrollIntoView({ behavior: "smooth", block: "start" })
  navOpen.value = false
}

watch(universe, () => {
  refsMap.value = {}
  navOpen.value = false
})

provide("go-to-paragraph", goToParagraph)
provide("lexicon-set-ref", setRef)
</script>

<template>
  <div class="lexicon-shell">
    <div class="universe-bar">
      <div class="universe-select">
        <div
          v-for="u in universes"
          :key="u.id"
          role="button"
          tabindex="0"
          :class="{ active: universe === u.id }"
          :data-agent="`lexicon:universe:${u.id}`"
          @click="selectUniverse(u.id)"
          @keydown.enter="selectUniverse(u.id)"
        >
          {{ u.name }}
        </div>
      </div>
      <small class="universe-hint">{{ universeInfo.tagline }}</small>
    </div>

    <div class="d-flex flex-grow-1 lexicon">
      <div class="mobile-nav-toggle">
        <button class="btn btn-primary" @click="navOpen = !navOpen">
          {{ navOpen ? 'Inhaltsverzeichnis schließen' : 'Inhaltsverzeichnis öffnen' }}
        </button>
      </div>

      <div class="nav-overlay" v-if="navOpen" @click="closeNav" />

      <div class="sidenav" :class="{ open: navOpen }">
        <component :is="current" part="toc" />
      </div>

      <div class="text-content">
        <component :is="current" part="body" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lexicon-shell {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--primary-color);
  height: 100%;
  min-height: 0;
}

.universe-bar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.85rem 1.25rem;
  background:
    radial-gradient(900px 420px at 12% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%),
    linear-gradient(180deg, color-mix(in srgb, #ffffff 6%, transparent), transparent 55%),
    linear-gradient(180deg, var(--bg-2), var(--bg-1));
}

.universe-select {
  display: flex;
  border: 2px solid var(--primary-color);
  border-radius: 1rem;
  overflow: hidden;

  div {
    cursor: pointer;
    user-select: none;
    text-align: center;
    padding: 0.5rem 1.1rem;
    font-family: Cinzel, serif;
    letter-spacing: 0.02em;
    font-size: 1rem;
    color: var(--text-2);
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    transition: background var(--dur-2) var(--ease-2), color var(--dur-2) var(--ease-2);

    &:last-child {
      border-right: 0;
    }

    &:hover {
      color: var(--text-1);
      background: color-mix(in srgb, #ffffff 6%, transparent);
    }

    &.active {
      background: var(--primary-color);
      color: var(--accent-contrast);
    }
  }
}

.universe-hint {
  color: var(--text-3);
  font-size: 0.95rem;
}

.lexicon {
  gap: 1px;
  background: var(--primary-color);
  flex: 1 1 auto;
  min-height: 0;
  & > * {
    background:
      radial-gradient(900px 420px at 12% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%),
      linear-gradient(180deg, color-mix(in srgb, #ffffff 6%, transparent), transparent 55%),
      linear-gradient(180deg, var(--bg-2), var(--bg-1));
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    min-height: 0;
  }
  .sidenav {
    width: 20%;
    max-width: 22rem;
    :deep(> *) {
      padding-right: 1.5rem;
    }
  }
  .text-content {
    flex: 1;
    padding: 2rem 3rem;
    color: #fff;
    font-size: 1.15rem;
    line-height: 1.6;
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-bottom: 0;
      margin-top: 2rem;
      font-family: Cinzel, serif;
      letter-spacing: 0.02em;
    }
    :deep(h2) {
      margin-top: 5rem;
      font-size: 1.75rem;
    }
    :deep(hr) {
      border: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.12);
      margin: 0.75rem 0;
    }
  }
}

.lexicon {
  display: flex;
  flex-direction: row;
  min-height: 0;
}

.mobile-nav-toggle {
  display: none;
}

.nav-overlay {
  display: none;
}

@media (max-width: 1000px) {
  .lexicon {
    position: relative;
    flex-direction: column;
  }

  .universe-bar {
    justify-content: center;
    padding: 0.75rem 1rem;
  }

  .universe-hint {
    display: none;
  }

  .mobile-nav-toggle {
    display: flex;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: color-mix(in srgb, #000 25%, transparent);
    z-index: 3;
    justify-content: center;
  }

  .nav-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 9;
  }

  .sidenav {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: min(22rem, 85vw) !important;
    transform: translateX(-105%);
    transition: transform 180ms ease;
    z-index: 10;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .sidenav.open {
    transform: translateX(0);
  }

  .sidenav :deep(> *) {
    padding-right: 0;
  }

  .text-content {
    width: 100% !important;
    padding: 1.25rem 1rem;
    font-size: 1.05rem;
    :deep(h2) {
      margin-top: 3rem;
    }
  }
}
</style>
