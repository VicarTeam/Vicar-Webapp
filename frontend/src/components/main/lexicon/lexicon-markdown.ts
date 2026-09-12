export interface IMdSegment {
  text: string
  bold: boolean
  italic: boolean
  code: boolean
}

export type MdBlock =
  | { kind: "paragraph"; lines: IMdSegment[][] }
  | { kind: "list"; ordered: boolean; items: IMdSegment[][] }
  | { kind: "table"; head: IMdSegment[][]; rows: IMdSegment[][][] }
  | { kind: "quote"; lines: IMdSegment[][] }
  | { kind: "heading"; level: number; segments: IMdSegment[] }
  | { kind: "code"; lines: string[] }
  | { kind: "rule" }

const HEADING = /^(#{1,6})\s+(.*)$/
const UNORDERED = /^[-*+]\s+(.*)$/
const ORDERED = /^\d+[.)]\s+(.*)$/
const RULE = /^(-{3,}|\*{3,}|_{3,})$/
const FENCE = /^```/
const INLINE = /`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*\n]+\*/g

function segment(text: string, bold: boolean, italic: boolean, code: boolean): IMdSegment {
  return { text, bold, italic, code }
}

function stripHardBreak(text: string): string {
  return text.replace(/\\$/, "").trimEnd()
}

export function parseInline(text: string): IMdSegment[] {
  const segments: IMdSegment[] = []
  let last = 0
  INLINE.lastIndex = 0

  let match = INLINE.exec(text)
  while (match) {
    const token = match[0]
    if (match.index > last) {
      segments.push(segment(text.slice(last, match.index), false, false, false))
    }
    if (token.startsWith("`")) {
      segments.push(segment(token.slice(1, -1), false, false, true))
    } else if (token.startsWith("***")) {
      segments.push(segment(token.slice(3, -3), true, true, false))
    } else if (token.startsWith("**")) {
      segments.push(segment(token.slice(2, -2), true, false, false))
    } else {
      segments.push(segment(token.slice(1, -1), false, true, false))
    }
    last = match.index + token.length
    match = INLINE.exec(text)
  }

  if (last < text.length) {
    segments.push(segment(text.slice(last), false, false, false))
  }
  if (!segments.length) {
    segments.push(segment(text, false, false, false))
  }
  return segments
}

function isTableRow(line: string): boolean {
  return line.startsWith("|")
}

function isTableDivider(line: string): boolean {
  return isTableRow(line) && line.includes("-") && /^[|\s:-]+$/.test(line)
}

function isBlockStart(line: string): boolean {
  return (
    !line ||
    isTableRow(line) ||
    RULE.test(line) ||
    FENCE.test(line) ||
    HEADING.test(line) ||
    UNORDERED.test(line) ||
    ORDERED.test(line) ||
    line.startsWith(">")
  )
}

function splitRow(line: string): IMdSegment[][] {
  const trimmed = line.replace(/^\|/, "").replace(/\|$/, "")
  return trimmed.split("|").map((cell) => parseInline(cell.trim()))
}

export function parseMarkdown(source: string): MdBlock[] {
  const lines = (source ?? "").replace(/\r\n?/g, "\n").split("\n")
  const blocks: MdBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = (lines[index] ?? "").trim()

    if (!line) {
      index++
      continue
    }

    if (FENCE.test(line)) {
      const code: string[] = []
      index++
      while (index < lines.length && !FENCE.test((lines[index] ?? "").trim())) {
        code.push(lines[index] ?? "")
        index++
      }
      index++
      blocks.push({ kind: "code", lines: code })
      continue
    }

    if (RULE.test(line)) {
      blocks.push({ kind: "rule" })
      index++
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1]!.length, segments: parseInline(heading[2] ?? "") })
      index++
      continue
    }

    if (isTableRow(line) && isTableDivider((lines[index + 1] ?? "").trim())) {
      const head = splitRow(line)
      const rows: IMdSegment[][][] = []
      index += 2
      while (index < lines.length && isTableRow((lines[index] ?? "").trim())) {
        rows.push(splitRow((lines[index] ?? "").trim()))
        index++
      }
      blocks.push({ kind: "table", head, rows })
      continue
    }

    if (UNORDERED.test(line) || ORDERED.test(line)) {
      const ordered = !UNORDERED.test(line)
      const items: IMdSegment[][] = []
      while (index < lines.length) {
        const current = (lines[index] ?? "").trim()
        const unordered = UNORDERED.exec(current)
        const numbered = ORDERED.exec(current)
        if (!ordered && unordered) {
          items.push(parseInline(unordered[1] ?? ""))
        } else if (ordered && numbered) {
          items.push(parseInline(numbered[1] ?? ""))
        } else {
          break
        }
        index++
      }
      blocks.push({ kind: "list", ordered, items })
      continue
    }

    if (line.startsWith(">")) {
      const quote: IMdSegment[][] = []
      while (index < lines.length && (lines[index] ?? "").trim().startsWith(">")) {
        quote.push(parseInline((lines[index] ?? "").trim().replace(/^>\s?/, "")))
        index++
      }
      blocks.push({ kind: "quote", lines: quote })
      continue
    }

    const paragraph: IMdSegment[][] = [parseInline(stripHardBreak(line))]
    index++
    while (index < lines.length) {
      const current = (lines[index] ?? "").trim()
      if (isBlockStart(current)) {
        break
      }
      paragraph.push(parseInline(stripHardBreak(current)))
      index++
    }
    blocks.push({ kind: "paragraph", lines: paragraph })
  }

  return blocks
}

export function markdownToPlainText(source: string): string {
  return (source ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/[*`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}
