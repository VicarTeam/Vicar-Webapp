<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue"
import { EditorContent, FloatingMenu, useEditor } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import { Markdown } from "tiptap-markdown"

/**
 * Obsidian-artiger Markdown-Editor (TipTap, WYSIWYG): getippte Markdown-Syntax
 * (# , **, *, ~~, - , 1. ) wird live in formatierte Knoten umgewandelt; gespeichert
 * und geladen wird Markdown. Underline per Strg/Cmd+U, Tabellen über das Floating-"+".
 * Keine Toolbar.
 */

const props = withDefaults(defineProps<{ modelValue?: string; agentId?: string; agentLabel?: string }>(), {
  modelValue: "",
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "change"): void
}>()

const editor = useEditor({
  content: props.modelValue || "",
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
    Underline,
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Markdown.configure({ html: true, transformPastedText: true, breaks: true, linkify: true }),
  ],
  onUpdate: ({ editor }) => {
    const md = editor.storage.markdown.getMarkdown()
    emit("update:modelValue", md)
    emit("change")
  },
})

// Externe Änderungen (Charakterwechsel, Live-Sync) übernehmen – aber nie während
// des Tippens, und nur wenn sich der Markdown-Inhalt tatsächlich unterscheidet
// (verhindert Cursor-Reset und Update-Schleifen).
watch(
  () => props.modelValue,
  (val) => {
    const ed = editor.value
    if (!ed || ed.isFocused) return
    const current = ed.storage.markdown.getMarkdown()
    if ((val || "") === current) return
    ed.commands.setContent(val || "", false)
  },
)

function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

function onAgentSet(e: Event) {
  const val = (e as CustomEvent).detail?.value ?? ""
  editor.value?.commands.setContent(val, false)
  emit("update:modelValue", val)
  emit("change")
}

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div
    class="md-editor"
    :data-agent="agentId || undefined"
    :data-agent-richtext="agentId ? '' : undefined"
    :data-agent-label="agentId ? (agentLabel ?? agentId) : undefined"
    @vicar-agent-set="onAgentSet"
    @click.self="editor?.commands.focus('end')"
  >
    <FloatingMenu v-if="editor" :editor="editor" :tippy-options="{ duration: 100, placement: 'left-start' }">
      <button type="button" class="md-floating-add" @click="insertTable">
        <i class="fa-solid fa-table-cells"></i> Tabelle
      </button>
    </FloatingMenu>

    <EditorContent :editor="editor" class="md-content" />
  </div>
</template>

<style scoped lang="scss">
.md-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  // Feste, kompakte Default-Höhe (Inhalt scrollt darüber hinaus intern) – wächst
  // also NICHT unbegrenzt mit dem Text. Per Resize-Griff vertikal vergrößerbar.
  height: 10rem;
  min-height: 6rem;
  max-height: 85vh;
  resize: vertical;
  overflow: auto;
  border-radius: var(--radius-2);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
  color: var(--text-1);
  // Kleinere Standard-Schriftgröße als der App-Default (nur im Editor).
  font-size: 1rem;
  padding: 0.6rem 0.85rem;
  box-shadow: var(--shadow-hairline), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: border-color var(--dur-2) var(--ease-1), box-shadow var(--dur-2) var(--ease-1);

  &:focus-within {
    border-color: color-mix(in srgb, var(--accent) 60%, rgba(255, 255, 255, 0.12));
    box-shadow:
        var(--shadow-hairline),
        0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
}

// EditorContent-Host füllt die (ggf. größer gezogene) Höhe, damit der ganze
// Bereich klick-/editierbar ist.
.md-editor :deep(.md-content) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.md-editor :deep(.ProseMirror) {
  flex: 1 1 auto;
  min-height: 5rem;
  outline: none;
  line-height: 1.5;

  > * + * {
    margin-top: 0.5em;
  }

  p {
    margin: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: "Cinzel";
    font-weight: 650;
    letter-spacing: 0.4px;
    line-height: 1.25;
    margin: 0.2em 0;
  }
  h1 { font-size: 1.6rem; }
  h2 { font-size: 1.4rem; }
  h3 { font-size: 1.2rem; }
  h4 { font-size: 1.08rem; }
  h5 { font-size: 1rem; }
  h6 { font-size: 0.9rem; color: var(--text-2); }

  strong { font-weight: 750; }
  em { font-style: italic; }
  s { text-decoration: line-through; }
  u { text-decoration: underline; }

  // Listen MIT sichtbaren Markern (globale Resets entfernen sie sonst).
  ul {
    list-style: disc;
    padding-left: 1.4em;
  }
  ol {
    list-style: decimal;
    padding-left: 1.6em;
  }
  li {
    margin: 0.15em 0;
    > p { margin: 0; }
  }
  ul ul { list-style: circle; }
  ul ul ul { list-style: square; }

  // Tabellen
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.4em 0;
    table-layout: fixed;
    overflow: hidden;
  }
  th, td {
    border: 1px solid color-mix(in srgb, var(--accent) 26%, rgba(255, 255, 255, 0.14));
    padding: 0.4rem 0.55rem;
    vertical-align: top;
    text-align: left;
  }
  th {
    background: color-mix(in srgb, var(--accent) 18%, var(--bg-3));
    font-weight: 650;
  }
  .selectedCell::after {
    content: "";
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    pointer-events: none;
  }
  .column-resize-handle {
    background: var(--accent);
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: rgba(255, 255, 255, 0.08);
    padding: 0.05em 0.3em;
    border-radius: 6px;
    font-size: 0.92em;
  }
  blockquote {
    border-left: 3px solid color-mix(in srgb, var(--accent) 55%, transparent);
    padding-left: 0.8em;
    color: var(--text-2);
    margin: 0.3em 0;
  }
  a {
    color: color-mix(in srgb, var(--accent) 80%, #ffffff);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
}
</style>

<style lang="scss">
/* FloatingMenu wird per tippy an den body gehängt -> nicht scoped stylebar. */
.md-floating-add {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.82rem;
  cursor: pointer;
  color: var(--text-1);
  background: linear-gradient(180deg, var(--bg-3), var(--bg-2));
  border: 1px solid color-mix(in srgb, var(--accent) 45%, rgba(255, 255, 255, 0.12));
  box-shadow: var(--shadow-hairline), 0 8px 20px rgba(0, 0, 0, 0.35);
  transition: filter 120ms ease, border-color 120ms ease;

  &:hover {
    filter: brightness(1.07);
    border-color: color-mix(in srgb, var(--accent) 65%, #ffffff);
  }
}
</style>
