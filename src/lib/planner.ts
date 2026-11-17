import { dateKeyOf, parseDateKey, zoneParts, zonedTimeToUtc } from './time'
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

const DEFAULT_DURATION = 60
const HOUR_MS = 3_600_000

/** Nombre de colonnes horaires qu'une réunion doit pouvoir couvrir. */
export function meetingSpan(durationMinutes: number): number {
  return Math.max(1, Math.ceil(durationMinutes / 60))
}

function spanPenalty(columns: Column[], index: number, span: number): number {
  let total = 0
  for (let offset = 0; offset < span && index + offset < columns.length; offset += 1) {
    total += columns[index + offset].penalty
  }
  return total
}

/**
 * Construit la grille à partir d'instants UTC consécutifs, pas d'heures locales :
 * le passage à l'heure d'été retire une colonne (23), celui d'automne en ajoute
 * une (25), sans jamais produire de doublon d'instant.
 */
export function buildColumns(
  dateKey: string,
  anchorZone: string,
  participants: Participant[],
  work: WorkHours,
): Column[] {
  const { year, month, day } = parseDateKey(dateKey)
  const columns: Column[] = []

  let instant = zonedTimeToUtc(year, month, day, 0, anchorZone)
  for (let guard = 0; guard < 48 && dateKeyOf(zoneParts(instant, anchorZone)) !== dateKey; guard += 1) {
    instant += dateKeyOf(zoneParts(instant, anchorZone)) < dateKey ? HOUR_MS : -HOUR_MS
  }

  for (let guard = 0; guard < 26 && dateKeyOf(zoneParts(instant, anchorZone)) === dateKey; guard += 1) {
    const anchorHour = zoneParts(instant, anchorZone).hour
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

    columns.push({
      hour: anchorHour,
      instant,
      parts,
      penalty,
      available,
      everyoneFree: available === participants.length,
    })
    instant += HOUR_MS
  }

  return columns
}

export function bestWindow(
  columns: Column[],
  durationMinutes = DEFAULT_DURATION,
): { start: number; end: number } | null {
  let best: { start: number; length: number } | null = null
  let runStart = -1

  for (let index = 0; index <= columns.length; index += 1) {
    const free = index < columns.length && columns[index].everyoneFree
    if (free && runStart === -1) runStart = index
    if (!free && runStart !== -1) {
      const length = index - runStart
      if (length * 60 >= durationMinutes && (!best || length > best.length)) {
        best = { start: runStart, length }
      }
      runStart = -1
    }
  }

  return best ? { start: best.start, end: best.start + best.length } : null
}

export function leastConstrained(
  columns: Column[],
  durationMinutes = DEFAULT_DURATION,
): Column {
  const span = meetingSpan(durationMinutes)
  let best = columns[0]
  let bestScore = spanPenalty(columns, 0, span)

  for (let index = 1; index <= columns.length - span; index += 1) {
    const score = spanPenalty(columns, index, span)
    if (score < bestScore) {
      best = columns[index]
      bestScore = score
    }
  }

  return best
}

/** Disponibilité minimale sur toute la durée de la réunion. */
export function spanAvailability(
  columns: Column[],
  column: Column,
  durationMinutes = DEFAULT_DURATION,
): number {
  const span = meetingSpan(durationMinutes)
  const index = columns.indexOf(column)
  if (index < 0 || index + span > columns.length) return 0

  let minimum = Number.POSITIVE_INFINITY
  for (let offset = 0; offset < span; offset += 1) {
    minimum = Math.min(minimum, columns[index + offset].available)
  }
  return Number.isFinite(minimum) ? minimum : 0
}

export function defaultColumn(columns: Column[], durationMinutes = DEFAULT_DURATION): Column {
  const window = bestWindow(columns, durationMinutes)
  if (window) {
    const middle = window.start + Math.floor((window.end - window.start - 1) / 2)
    return columns[Math.min(middle, window.end - meetingSpan(durationMinutes))]
  }

  return leastConstrained(columns, durationMinutes)
}

export function defaultHour(columns: Column[], durationMinutes = DEFAULT_DURATION): number {
  return defaultColumn(columns, durationMinutes).hour
}

export function suggestColumns(
  columns: Column[],
  limit = 3,
  durationMinutes = DEFAULT_DURATION,
): Column[] {
  const span = meetingSpan(durationMinutes)
  const ranked = columns
    .map((column, index) => ({ column, index, score: spanPenalty(columns, index, span) }))
    .filter((entry) => entry.index + span <= columns.length)
    .sort((a, b) => a.score - b.score || a.column.hour - b.column.hour)

  const chosen: Column[] = []

  for (const candidate of ranked) {
    if (chosen.length >= limit) break
    if (chosen.every((column) => Math.abs(column.hour - candidate.column.hour) >= 2)) {
      chosen.push(candidate.column)
    }
  }

  return chosen.sort((a, b) => a.hour - b.hour)
}
