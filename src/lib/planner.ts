import { dateKeyOf, dayOffset, parseDateKey, zoneParts, zonedTimeToUtc } from './time'
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

/** Minute locale depuis minuit, ramenée à la date de référence (gère +1j / −1j). */
function localMinuteIndex(part: ZoneParts, referenceKey: string): number {
  return dayOffset(referenceKey, dateKeyOf(part)) * 1440 + part.hour * 60 + part.minute
}

/**
 * Vrai si la réunion entière, et pas seulement son début, tient dans les horaires.
 * La référence est la date LOCALE du début pour chaque ville : un horaire de
 * 09:00–18:00 s'applique au 18:00 local de New York même si, à ce moment-là,
 * Paris est déjà au lendemain.
 */
export function fitsWorkHours(startPart: ZoneParts, endPart: ZoneParts, work: WorkHours): boolean {
  // La fin est mesurée depuis le jour LOCAL du début : une réunion 23h–00h
  // reste dans une journée 0h–24h (ou 22h–24h) sans devenir disponible pour
  // autant dans une journée 9h–18h.
  const referenceKey = dateKeyOf(startPart)
  const start = localMinuteIndex(startPart, referenceKey)
  const end = localMinuteIndex(endPart, referenceKey)
  const workStart = work.start * 60
  const workEnd = work.end * 60
  if (start < workStart || start >= workEnd) return false
  // Une journée entière (0h–24h) couvre tous les instants, y compris une
  // réunion qui franchit minuit dans l'heure locale de la ville.
  if (workStart === 0 && workEnd === 1440) return true
  return end <= workEnd
}

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
 * une (25), sans jamais produire de doublon d'instant. La disponibilité porte
 * sur toute la durée de la réunion, heure locale de fin comprise.
 */
export function buildColumns(
  dateKey: string,
  anchorZone: string,
  participants: Participant[],
  work: WorkHours,
  durationMinutes = DEFAULT_DURATION,
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
    const endInstant = instant + durationMinutes * 60_000
    const endParts = participants.map((participant) => zoneParts(endInstant, participant.zone))
    let penalty = 0
    let available = 0

    for (const [index, part] of parts.entries()) {
      const start = work.start * 60
      const end = work.end * 60
      const localDate = dateKeyOf(part)
      const startMinutes = localMinuteIndex(part, localDate)
      const endMinutes = localMinuteIndex(endParts[index], localDate)
      if (fitsWorkHours(part, endParts[index], work)) {
        available += 1
      } else if (startMinutes < start) {
        penalty += Math.max(1, start - startMinutes)
      } else if (startMinutes >= end) {
        penalty += Math.max(1, startMinutes - end)
      } else {
        penalty += Math.max(1, endMinutes - end)
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
  if (durationMinutes <= 0) return null
  let best: { start: number; length: number } | null = null
  let runStart = -1

  for (let index = 0; index <= columns.length; index += 1) {
    const free = index < columns.length && columns[index].everyoneFree
    if (free && runStart === -1) runStart = index
    if (!free && runStart !== -1) {
      const length = index - runStart
      // Chaque colonne a déjà été évaluée sur toute la durée : une seule
      // suffit, même pour 90 minutes (9h00–10h30 par exemple).
      if (!best || length > best.length) best = { start: runStart, length }
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

/** Disponibilité du créneau, déjà calculée sur toute la durée dans buildColumns. */
export function spanAvailability(
  columns: Column[],
  column: Column,
  durationMinutes = DEFAULT_DURATION,
): number {
  if (durationMinutes <= 0 || !columns.includes(column)) return 0
  return column.available
}

export function defaultColumn(columns: Column[], durationMinutes = DEFAULT_DURATION): Column {
  const window = bestWindow(columns, durationMinutes)
  if (window) {
    const middle = window.start + Math.floor((window.end - window.start - 1) / 2)
    return columns[Math.min(middle, window.end - 1)]
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
