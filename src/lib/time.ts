export type ZoneParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  weekday: string
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    })
    formatters.set(timeZone, formatter)
  }
  return formatter
}

export function zoneParts(instant: number, timeZone: string): ZoneParts {
  const parts: Record<string, string> = {}
  for (const part of formatterFor(timeZone).formatToParts(new Date(instant))) {
    if (part.type !== 'literal') parts[part.type] = part.value
  }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    weekday: parts.weekday,
  }
}

export function zoneOffsetMs(instant: number, timeZone: string): number {
  const parts = zoneParts(instant, timeZone)
  const wallClock = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0)
  const wholeSeconds = Math.floor(instant / 1000) * 1000
  return wallClock - wholeSeconds
}

/**
 * Turns a wall-clock time in a given zone into a UTC instant.
 * Iterates a couple of times so DST transitions resolve correctly.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  timeZone: string,
): number {
  const wallClock = Date.UTC(year, month - 1, day, hour)
  let instant = wallClock
  for (let i = 0; i < 3; i += 1) {
    const offset = zoneOffsetMs(instant, timeZone)
    const next = wallClock - offset
    if (next === instant) break
    instant = next
  }
  return instant
}

const pad = (value: number) => String(value).padStart(2, '0')

export function dateKeyOf(parts: ZoneParts): string {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

export function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [year, month, day] = key.split('-').map(Number)
  return { year, month, day }
}

export function todayKey(timeZone: string, now = Date.now()): string {
  return dateKeyOf(zoneParts(now, timeZone))
}

export function shiftDateKey(key: string, days: number): string {
  const { year, month, day } = parseDateKey(key)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

export function dayOffset(fromKey: string, toKey: string): number {
  const from = parseDateKey(fromKey)
  const to = parseDateKey(toKey)
  const fromStamp = Date.UTC(from.year, from.month - 1, from.day)
  const toStamp = Date.UTC(to.year, to.month - 1, to.day)
  return Math.round((toStamp - fromStamp) / 86_400_000)
}

export function formatTime(parts: Pick<ZoneParts, 'hour' | 'minute'>): string {
  return parts.minute === 0 ? `${parts.hour}h` : `${parts.hour}h${pad(parts.minute)}`
}

export function offsetLabel(instant: number, timeZone: string): string {
  const minutes = Math.round(zoneOffsetMs(instant, timeZone) / 60000)
  if (minutes === 0) return 'UTC'
  const sign = minutes > 0 ? '+' : '−'
  const absolute = Math.abs(minutes)
  const hours = Math.floor(absolute / 60)
  const remainder = absolute % 60
  return `UTC${sign}${hours}${remainder ? `:${pad(remainder)}` : ''}`
}

const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDateLabel(key: string): string {
  const { year, month, day } = parseDateKey(key)
  return longDateFormatter.format(new Date(Date.UTC(year, month - 1, day)))
}
