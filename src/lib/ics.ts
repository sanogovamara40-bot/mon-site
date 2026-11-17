const CRLF = '\r\n'
const MAX_LINE_BYTES = 75
const encoder = new TextEncoder()

function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0')
}

function utcStamp(instant: number): string {
  const date = new Date(instant)
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

/**
 * RFC 5545 line folding: no line may exceed 75 octets, continuation lines
 * start with a single space. Characters are never split mid-codepoint.
 */
export function foldIcsLine(line: string): string {
  const parts: string[] = []
  let current = ''
  let bytes = 0

  for (const char of line) {
    const size = encoder.encode(char).length
    if (bytes + size > MAX_LINE_BYTES) {
      parts.push(current)
      current = ' '
      bytes = 1
    }
    current += char
    bytes += size
  }

  parts.push(current)
  return parts.join(CRLF)
}

export type IcsEvent = {
  start: number
  end: number
  title: string
  description?: string
  url?: string
  uid?: string
  now?: number
}

export function buildIcs(event: IcsEvent): string {
  const stamp = utcStamp(event.now ?? Date.now())
  const uid =
    event.uid ??
    `unanime-${event.start}-${Math.random().toString(36).slice(2, 10)}@unanime.app`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Unanime//Planificateur de reunion//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Unanime',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${utcStamp(event.start)}`,
    `DTEND:${utcStamp(event.end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ]

  if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`)
  if (event.url) lines.push(`URL:${escapeIcsText(event.url)}`)

  lines.push('STATUS:CONFIRMED', 'TRANSP:OPAQUE', 'END:VEVENT', 'END:VCALENDAR')

  return `${lines.map(foldIcsLine).join(CRLF)}${CRLF}`
}

export function icsFilename(dateKey: string, hour: number, minute: number): string {
  return `unanime-${dateKey}-${pad(hour)}h${pad(minute)}.ics`
}

export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
