import {readFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe, expect, it} from 'vitest'
import {markdownToPlainText, parseInline, parseMarkdown} from '@/components/main/lexicon/lexicon-markdown'

interface LexiconEntry {
  key: string
  section: string
  title: string
  body: string
  tags: string[]
}

const lexicon = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../../backend-go/internal/darkborne/data/lexicon.json',
    ),
    'utf8',
  ),
) as LexiconEntry[]

describe('Lexikon-Markdown', () => {
  it('erkennt Absätze, Listen und Tabellen', () => {
    const blocks = parseMarkdown([
      '## Proben',
      '',
      'Jeder Würfel ab 6 ist ein Erfolg.',
      '',
      '- Erster Punkt',
      '- Zweiter Punkt',
      '',
      '| Stufe | Wirkung |',
      '| --- | --- |',
      '| Stark | 1 Verheerung |',
      '| Extrem | 3 Verheerung |',
    ].join('\n'))

    const kinds = blocks.map(b => b.kind)
    expect(kinds).toEqual(['heading', 'paragraph', 'list', 'table'])

    const table = blocks.find(b => b.kind === 'table')
    expect(table && table.kind === 'table' && table.head).toHaveLength(2)
    expect(table && table.kind === 'table' && table.rows).toHaveLength(2)

    const list = blocks.find(b => b.kind === 'list')
    expect(list && list.kind === 'list' && list.items).toHaveLength(2)
  })

  it('erkennt fett, kursiv und Code', () => {
    const segments = parseInline('Ein **fetter** und ein *kursiver* Wert sowie `Code`')
    expect(segments.find(s => s.bold)?.text).toBe('fetter')
    expect(segments.find(s => s.italic)?.text).toBe('kursiver')
    expect(segments.find(s => s.code)?.text).toBe('Code')
  })

  it('behandelt harte Zeilenumbrüche als Umbruch, nicht als Backslash', () => {
    const blocks = parseMarkdown('Erste Zeile,\\\nzweite Zeile.')
    const block = blocks[0]!
    expect(block.kind).toBe('paragraph')
    const texts = block.kind === 'paragraph' ? block.lines.map(l => l.map(s => s.text).join('')) : []
    expect(texts).toEqual(['Erste Zeile,', 'zweite Zeile.'])
  })

  it('lässt keine Backslashes in den Regelwerkstexten stehen', () => {
    for (const entry of lexicon) {
      for (const block of parseMarkdown(entry.body)) {
        if (block.kind !== 'paragraph') continue
        for (const line of block.lines) {
          const text = line.map(s => s.text).join('')
          expect(text.endsWith('\\'), `Eintrag ${entry.key} endet mit einem Backslash`).toBe(false)
        }
      }
    }
  })

  it('macht aus Markdown durchsuchbaren Text', () => {
    const plain = markdownToPlainText('**Hunger** bringt | Stufe | Wirkung |\n- ein Blutwürfel')
    expect(plain).not.toContain('**')
    expect(plain).toContain('Hunger')
  })

  it('rendert jeden Eintrag des Regelwerks ohne Verlust', () => {
    expect(lexicon.length).toBeGreaterThan(40)
    for (const entry of lexicon) {
      const blocks = parseMarkdown(entry.body)
      expect(blocks.length, `Eintrag ${entry.key} ergibt keine Blöcke`).toBeGreaterThan(0)
      for (const block of blocks) {
        if (block.kind === 'table') {
          expect(block.head.length, `Tabelle in ${entry.key} ohne Kopf`).toBeGreaterThan(0)
          for (const row of block.rows) {
            expect(row.length, `Tabellenzeile in ${entry.key} ist leer`).toBeGreaterThan(0)
          }
        }
      }
      const plain = markdownToPlainText(entry.body)
      expect(plain.includes('|'), `Suchtext von ${entry.key} enthält Tabellenzeichen`).toBe(false)
    }
  })

  it('behält jede Tabellenzeile der Regelwerke', () => {
    let tables = 0
    let rows = 0
    for (const entry of lexicon) {
      for (const block of parseMarkdown(entry.body)) {
        if (block.kind === 'table') {
          tables += 1
          rows += block.rows.length
        }
      }
    }
    expect(tables).toBeGreaterThan(20)
    expect(rows).toBeGreaterThan(100)
  })
})
