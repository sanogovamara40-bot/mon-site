import { describe, expect, it } from 'vitest'
import {
  bestWindow,
  buildColumns,
  defaultHour,
  leastConstrained,
  spanAvailability,
  suggestColumns,
} from './planner'
import type { Column } from './planner'
import type { Participant, WorkHours } from './planner'

const paris: Participant = {
  city: 'Paris',
  country: 'France',
  countryCode: 'FR',
  zone: 'Europe/Paris',
}
const london: Participant = {
  city: 'Londres',
  country: 'Royaume-Uni',
  countryCode: 'GB',
  zone: 'Europe/London',
}
const newYork: Participant = {
  city: 'New York',
  country: 'États-Unis',
  countryCode: 'US',
  zone: 'America/New_York',
}
const tokyo: Participant = {
  city: 'Tokyo',
  country: 'Japon',
  countryCode: 'JP',
  zone: 'Asia/Tokyo',
}
const sanFrancisco: Participant = {
  city: 'San Francisco',
  country: 'États-Unis',
  countryCode: 'US',
  zone: 'America/Los_Angeles',
}

const officeHours: WorkHours = { start: 9, end: 18 }

describe('buildColumns', () => {
  it('builds 24 hourly columns anchored on the first participant', () => {
    const columns = buildColumns('2026-11-13', 'Europe/Paris', [paris, london, newYork], officeHours)

    expect(columns).toHaveLength(24)
    expect(columns[15].parts[0]).toMatchObject({ hour: 15, minute: 0 })
    expect(columns[15].parts[1]).toMatchObject({ hour: 14, minute: 0 })
    expect(columns[15].parts[2]).toMatchObject({ hour: 9, minute: 0 })
  })

  it('marks only the shared working window as free for everyone', () => {
    const columns = buildColumns('2026-11-13', 'Europe/Paris', [paris, london, newYork], officeHours)

    expect(columns[15].everyoneFree).toBe(true)
    expect(columns[16].everyoneFree).toBe(true)
    expect(columns[17].everyoneFree).toBe(true)
    expect(columns[14].everyoneFree).toBe(false)
    expect(columns[14].available).toBe(2)
    expect(columns[18].everyoneFree).toBe(false)
  })

  it('finds the shared window and a default hour in the middle', () => {
    const columns = buildColumns('2026-11-13', 'Europe/Paris', [paris, london, newYork], officeHours)

    expect(bestWindow(columns)).toEqual({ start: 15, end: 18 })
    expect(defaultHour(columns)).toBe(16)
  })

  it('returns no window when zones cannot overlap', () => {
    const columns = buildColumns(
      '2026-11-13',
      'Europe/Paris',
      [paris, tokyo, sanFrancisco],
      officeHours,
    )

    expect(bestWindow(columns)).toBeNull()
    expect(columns.every((column) => !column.everyoneFree)).toBe(true)
    expect(defaultHour(columns)).toBeGreaterThanOrEqual(0)
    expect(defaultHour(columns)).toBeLessThan(24)
  })

  it('treats a full-day range as one long window', () => {
    const columns = buildColumns('2026-11-13', 'Europe/Paris', [paris, tokyo], {
      start: 0,
      end: 24,
    })

    expect(columns.every((column) => column.everyoneFree)).toBe(true)
    expect(bestWindow(columns)).toEqual({ start: 0, end: 24 })
  })

  it('recommends the truly least constrained hour without a shared window', () => {
    const columns = buildColumns('2026-11-16', 'Europe/Paris', [paris, london, newYork], {
      start: 22,
      end: 24,
    })
    const fallback = leastConstrained(columns)

    expect(bestWindow(columns)).toBeNull()
    expect(fallback.hour).toBe(23)
    expect(fallback.available).toBe(2)
    expect(columns.every((column) => column.penalty >= fallback.penalty)).toBe(true)
    expect(defaultHour(columns)).toBe(23)
  })
})

describe('buildColumns et changements d’heure', () => {
  it('écarte l’heure inexistante du passage à l’heure d’été', () => {
    const columns = buildColumns('2026-03-29', 'Europe/Paris', [paris], officeHours)

    expect(columns).toHaveLength(23)
    expect(columns.some((column) => column.hour === 2)).toBe(false)
    expect(new Set(columns.map((column) => column.instant)).size).toBe(columns.length)
    expect(columns.map((column) => column.hour)).toContain(1)
    expect(columns.map((column) => column.hour)).toContain(3)
  })

  it('conserve les deux 02:00 au passage à l’heure d’hiver', () => {
    const columns = buildColumns('2026-10-25', 'Europe/Paris', [paris], officeHours)

    expect(columns).toHaveLength(25)
    expect(new Set(columns.map((column) => column.instant)).size).toBe(columns.length)
    expect(columns.filter((column) => column.hour === 2)).toHaveLength(2)
  })

  it('génère des instants UTC strictement consécutifs', () => {
    for (const date of ['2026-03-29', '2026-10-25', '2026-11-13']) {
      const columns = buildColumns(date, 'Europe/Paris', [paris], officeHours)
      for (let index = 1; index < columns.length; index += 1) {
        expect(columns[index].instant - columns[index - 1].instant).toBe(3_600_000)
      }
    }
  })
})

describe('durée de la réunion', () => {
  it('n’annonce un recouvrement que s’il contient toute la durée', () => {
    const columns = buildColumns('2026-11-13', 'Europe/Paris', [paris, tokyo], officeHours)

    expect(bestWindow(columns, 60)).toEqual({ start: 9, end: 10 })
    expect(bestWindow(columns, 90)).toBeNull()
    expect(bestWindow(columns, 30)).toEqual({ start: 9, end: 10 })
  })

  it('retombe sur le créneau le moins contraignant sur toute la durée', () => {
    const column = (hour: number, penalty: number, available: number): Column => ({
      hour,
      instant: hour * 3_600_000,
      parts: [],
      penalty,
      available,
      everyoneFree: false,
    })
    const columns = [
      column(0, 0, 1),
      column(1, 10, 0),
      column(2, 2, 1),
      column(3, 0, 1),
    ]

    expect(leastConstrained(columns, 60).hour).toBe(0)
    expect(leastConstrained(columns, 90).hour).toBe(2)
    expect(spanAvailability(columns, columns[0], 90)).toBe(0)
    expect(spanAvailability(columns, columns[2], 90)).toBe(1)
    expect(spanAvailability(columns, columns[3], 90)).toBe(0)
    expect(suggestColumns(columns, 1, 90)[0].hour).toBe(2)
  })

  it('garde le créneau par défaut dans la fenêtre commune pour 90 minutes', () => {
    const columns = buildColumns(
      '2026-11-13',
      'Europe/Paris',
      [paris, london, newYork],
      officeHours,
    )
    const window = bestWindow(columns, 90)
    const hour = defaultHour(columns, 90)

    expect(window).not.toBeNull()
    expect(hour).toBeGreaterThanOrEqual(window!.start)
    expect(hour + 2).toBeLessThanOrEqual(window!.end)
  })
})

describe('suggestColumns', () => {
  it('suggests at most three spread-out slots', () => {
    const columns = buildColumns(
      '2026-11-13',
      'Europe/Paris',
      [paris, tokyo, sanFrancisco],
      officeHours,
    )
    const suggestions = suggestColumns(columns)

    expect(suggestions).toHaveLength(3)
    for (let index = 1; index < suggestions.length; index += 1) {
      expect(suggestions[index].hour - suggestions[index - 1].hour).toBeGreaterThanOrEqual(2)
    }
    const minPenalty = Math.min(...columns.map((column) => column.penalty))
    expect(Math.min(...suggestions.map((suggestion) => suggestion.penalty))).toBe(minPenalty)
  })

  it('respects a custom limit', () => {
    const columns = buildColumns('2026-11-13', 'Europe/Paris', [paris, london], officeHours)
    expect(suggestColumns(columns, 2)).toHaveLength(2)
  })
})
