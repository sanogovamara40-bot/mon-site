import { parseDateKey, zoneParts, zonedTimeToUtc } from './time'
import type { ZoneParts } from './time'

export type Participant = {
  zone: string
  city: string
  country: string
  countryCode: string
}

export type WorkHours = {
  start: number
  end: number
}

export type Column = {
  hour: number
  instant: number
  parts: ZoneParts[]
  penalty: number
  available: number
  everyoneFree: boolean
}

export function buildColumns(
  dateKey: string,
  anchorZone: string,
  participants: Participant[],
  work: WorkHours,
): Column[] {
  const { year, month, day } = parseDateKey(dateKey)

  return Array.from({ length: 24 }, (_, hour) => {
    const instant = zonedTimeToUtc(year, month, day, hour, anchorZone)
    const parts = participants.map((participant) => zoneParts(instant, participant.zone))
    let penalty = 0
    let available = 0

    for (const part of parts) {
      const minutes = part.hour * 60 + part.minute
      const start = work.start * 60
      const end = work.end * 60
      if (minutes >= start && minutes < end) {
        available += 1
      } else if (minutes < start) {
        penalty += Math.max(1, start - minutes)
      } else {
        penalty += Math.max(1, minutes - end)
      }
    }

    return {
      hour,
      instant,
      parts,
      penalty,
      available,
      everyoneFree: available === participants.length,
    }
  })
}

export function bestWindow(columns: Column[]): { start: number; end: number } | null {
  let best: { start: number; length: number } | null = null
  let runStart = -1

  for (let index = 0; index <= columns.length; index += 1) {
    const free = index < columns.length && columns[index].everyoneFree
    if (free && runStart === -1) runStart = index
    if (!free && runStart !== -1) {
      const length = index - runStart
      if (!best || length > best.length) best = { start: runStart, length }
      runStart = -1
    }
  }

  return best ? { start: best.start, end: best.start + best.length } : null
}

export function defaultHour(columns: Column[]): number {
  const window = bestWindow(columns)
  if (window) return window.start + Math.floor((window.end - window.start - 1) / 2)

  return columns.reduce(
    (best, column) => (column.penalty < best.penalty ? column : best),
    columns[0],
  ).hour
}

export function suggestColumns(columns: Column[], limit = 3): Column[] {
  const candidates = [...columns].sort(
    (a, b) => a.penalty - b.penalty || a.hour - b.hour,
  )
  const chosen: Column[] = []

  for (const candidate of candidates) {
    if (chosen.length >= limit) break
    if (chosen.every((column) => Math.abs(column.hour - candidate.hour) >= 2)) {
      chosen.push(candidate)
    }
  }

  return chosen.sort((a, b) => a.hour - b.hour)
}
