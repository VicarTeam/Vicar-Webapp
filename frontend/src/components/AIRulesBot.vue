<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

const AI_KEY = localStorage.getItem('vicar::ai-rules-ggapi-key') || '';
const TEST_KEY = 'DasDarkisAITestingPlayground';
const HISTORY_KEY = 'vicar::ai-rules-history';

@Component({})
export default class AIRulesBot extends Vue {
  private show: boolean = false;
  private history: { question: string; answer: string }[] = [];
  private inputQuestion: string = '';
  private isLoading: boolean = false;
  private activeQuestion: string | null = null;
  private activeAnswerFull: string = '';
  private activeAnswerVisible: string = '';
  private typingTimer: number | null = null;

  mounted() {
    document.addEventListener('keydown', this.handleKeydown);
    this.loadHistory();
  }

  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
    this.stopTyping();
  }

  private get hasApiKey(): boolean {
    return AI_KEY.trim().length > 0;
  }

  private get isTyping(): boolean {
    return this.typingTimer !== null;
  }

  private handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    if (!this.hasApiKey) {
      return;
    }

    if (event.key.toUpperCase() === 'A' && event.altKey && event.shiftKey) {
      event.preventDefault();
      this.show = !this.show;
    }
  }

  private loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.history = parsed;
      }
    } catch (_) {}
  }

  private saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
    } catch (_) {}
  }

  private stopTyping() {
    if (this.typingTimer !== null) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
  }

  private startTyping() {
    this.stopTyping();
    this.activeAnswerVisible = '';
    const full = this.activeAnswerFull || '';
    let index = 0;

    if (!full.length) {
      if (this.activeQuestion) {
        this.history.unshift({
          question: this.activeQuestion,
          answer: '',
        });
        this.saveHistory();
      }
      return;
    }

    this.typingTimer = window.setInterval(() => {
      if (index >= full.length) {
        this.stopTyping();
        if (this.activeQuestion) {
          this.history.unshift({
            question: this.activeQuestion,
            answer: full,
          });
          this.saveHistory();
        }
        return;
      }
      this.activeAnswerVisible += full.charAt(index);
      index += 1;
    }, 20);
  }

  private async ask() {
    if (!this.hasApiKey) return;
    if (this.isLoading) return;
    const q = (this.inputQuestion || '').trim();
    if (!q.length) return;

    this.inputQuestion = '';
    this.isLoading = true;
    this.stopTyping();
    this.activeQuestion = q;
    this.activeAnswerFull = '';
    this.activeAnswerVisible = '';

    const answer = await this.getAnswer(q);
    this.isLoading = false;

    if (!answer) {
      this.activeAnswerFull =
        'Ich konnte leider keine Antwort abrufen. Bitte versuche es später erneut.';
    } else {
      this.activeAnswerFull = answer;
    }

    this.startTyping();
  }

  private async getAnswer(question: string): Promise<string | undefined> {
    if (!AI_KEY || AI_KEY.trim().length === 0) {
      return undefined;
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('question', question);
      if (AI_KEY !== TEST_KEY) {
        queryParams.append('ggai_key', AI_KEY);
      }

      const url = `https://gpt.7ity.de/environments/vicar/ask?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': '92578f5f-c770-49d0-9388-80e8b43b89dc',
        },
      });
      if (!response.ok) {
        return undefined;
      }
      const data = await response.json();
      return data.answer;
    } catch (_) {
      return undefined;
    }
  }
}
</script>

<template>
  <div v-if="show" class="ai-rules-bot card">
    <header class="card-header">
      <b>Aurelius, der Vampir-Archivar</b>
    </header>
    <div class="card-body">
      <div class="ai-input">
        <textarea
          v-model="inputQuestion"
          :placeholder="hasApiKey ? 'Stell deine Frage zu den Regeln …' : 'Ich kann gerade leider nichts tun!'"
          :disabled="!hasApiKey || isLoading"
        />
        <button
          class="ask-button"
          @click="ask"
          :disabled="!hasApiKey || isLoading || !inputQuestion.trim().length"
        >
          <span v-if="!isLoading">Frage stellen</span>
          <span v-else>Der Archivar denkt nach …</span>
        </button>
      </div>

      <div class="ai-current" v-if="activeQuestion || activeAnswerVisible">
        <div class="bubble user">
          <div class="label">Du</div>
          <div class="text">{{ activeQuestion }}</div>
        </div>
        <div class="bubble ai">
          <div class="label">Aurelius</div>
          <div class="text typewriter">
            <span>{{ activeAnswerVisible }}</span>
            <span v-if="isTyping || isLoading" class="cursor">▋</span>
          </div>
        </div>
      </div>

      <div class="ai-history" v-if="history.length">
        <div class="history-title">Verlauf</div>
        <div class="history-list">
          <div
            v-for="(entry, index) in history"
            :key="index"
            class="history-entry"
          >
            <div class="bubble user">
              <div class="label">Du</div>
              <div class="text">{{ entry.question }}</div>
            </div>
            <div class="bubble ai">
              <div class="label">Aurelius</div>
              <div class="text">{{ entry.answer }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-rules-bot {
  position: absolute;
  top: 2rem;
  right: 1rem;
  box-shadow: 0 0 10px 2px rgba(255, 0, 0, 0.7) !important;
  background: linear-gradient(#131219, #131219) padding-box,
  linear-gradient(var(--angle), #070707, #ff6868) border-box !important;
  animation: 8s rotate linear infinite;
  width: 35rem;
  height: 40rem;
  opacity: 0.4;
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  overflow-x: hidden;
  overflow-y: auto;
  &:hover {
    opacity: 1;
  }
  .card-header {
    text-align: center;
    background-color: var(--primary-color-dark) !important;
    color: var(--text-color-light) !important;
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem*1.25;
  }
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.85rem 0.9rem;
  gap: 0.75rem;
  color: var(--text-color-light);
  font-size: 0.85rem*1.25;
}

.ai-input {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  textarea {
    resize: none;
    min-height: 4.5rem;
    max-height: 8rem;
    border-radius: 0.4rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #0c0b11;
    color: var(--text-color-light);
    padding: 0.5rem 0.6rem;
    font-size: 0.85rem*1.25;
    outline: none;
    line-height: 1.4;
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  .ask-button {
    align-self: flex-end;
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    border: none;
    font-size: 0.8rem*1.25;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: linear-gradient(90deg, #ff6868, #ff3b3b);
    color: #fff;
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
    box-shadow: 0 0 8px rgba(255, 80, 80, 0.7);
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 0 12px rgba(255, 80, 80, 0.9);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 0 6px rgba(255, 80, 80, 0.5);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }
  }
}

.ai-current {
  border-radius: 0.5rem;
  padding: 0.5rem 0.6rem;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ai-history {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  .history-title {
    font-size: 0.75rem*1.25;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.7;
    margin-bottom: 0.2rem;
  }
  .history-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column-reverse;
    gap: 0.5rem;
    padding-right: 0.2rem;
  }
  .history-entry {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
}

.bubble {
  border-radius: 0.5rem;
  padding: 0.4rem 0.5rem;
  max-width: 100%;
  .label {
    font-size: 0.7rem*1.25;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.7;
    margin-bottom: 0.1rem;
  }
  .text {
    font-size: 0.82rem*1.25;
    line-height: 1.35;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  &.user {
    align-self: flex-end;
    background: rgba(255, 255, 255, 0.06);
  }
  &.ai {
    align-self: flex-start;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 80, 80, 0.3);
  }
}

.typewriter {
  position: relative;
  .cursor {
    display: inline-block;
    margin-left: 0.08rem;
    animation: blink 1s steps(2, start) infinite;
    font-size: 0.85rem;
  }
}

.ai-hint {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: auto;
  code {
    font-family: monospace;
    font-size: 0.75rem;
    background: rgba(255, 255, 255, 0.08);
    padding: 0.1rem 0.25rem;
    border-radius: 0.25rem;
  }
}

@keyframes rotate {
  to {
    --angle: 360deg;
  }
}

@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
