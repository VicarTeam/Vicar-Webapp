<script setup lang="ts">
import { computed } from "vue"
import LexiconInline from "@/components/main/lexicon/LexiconInline.vue"
import { parseMarkdown } from "@/components/main/lexicon/lexicon-markdown"

const props = defineProps<{
  source: string
}>()

const blocks = computed(() => parseMarkdown(props.source))

function headingTag(level: number): string {
  return `h${Math.min(6, level + 3)}`
}
</script>

<template>
  <div class="lx-md">
    <template v-for="(block, i) in blocks" :key="i">
      <p v-if="block.kind === 'paragraph'">
        <template v-for="(line, j) in block.lines" :key="j">
          <br v-if="j > 0" />
          <LexiconInline :segments="line" />
        </template>
      </p>

      <ul v-else-if="block.kind === 'list' && !block.ordered" class="lx-md-list">
        <li v-for="(item, j) in block.items" :key="j">
          <LexiconInline :segments="item" />
        </li>
      </ul>

      <ol v-else-if="block.kind === 'list'" class="lx-md-list">
        <li v-for="(item, j) in block.items" :key="j">
          <LexiconInline :segments="item" />
        </li>
      </ol>

      <div v-else-if="block.kind === 'table'" class="lx-md-tablewrap">
        <table class="table">
          <thead>
            <tr>
              <th v-for="(cell, j) in block.head" :key="j">
                <LexiconInline :segments="cell" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, j) in block.rows" :key="j">
              <td v-for="(cell, k) in row" :key="k">
                <LexiconInline :segments="cell" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <blockquote v-else-if="block.kind === 'quote'" class="lx-md-quote">
        <template v-for="(line, j) in block.lines" :key="j">
          <br v-if="j > 0" />
          <LexiconInline :segments="line" />
        </template>
      </blockquote>

      <pre v-else-if="block.kind === 'code'" class="lx-md-code"><code>{{ block.lines.join("\n") }}</code></pre>

      <component :is="headingTag(block.level)" v-else-if="block.kind === 'heading'">
        <LexiconInline :segments="block.segments" />
      </component>

      <hr v-else />
    </template>
  </div>
</template>

<style scoped lang="scss">
.lx-md {
  display: block;
}

.lx-md-list {
  list-style: disc;
  padding-left: 1.5rem;

  li {
    margin: 0.15rem 0;
  }
}

ol.lx-md-list {
  list-style: decimal;
}

.lx-md-tablewrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1rem 0;
}

.lx-md-quote {
  margin: 1rem 0;
  padding: 0.35rem 0 0.35rem 1rem;
  border-left: 3px solid color-mix(in srgb, var(--accent) 55%, transparent);
  color: var(--text-2);
  font-style: italic;
}

.lx-md-code {
  margin: 1rem 0;
  padding: 0.75rem 0.9rem;
  border-radius: var(--radius-1);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.35);
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre;
}
</style>
