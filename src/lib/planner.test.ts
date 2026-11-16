import { describe, expect, it } from 'vitest'
import { bestWindow, buildColumns, defaultHour, leastConstrained, suggestColumns } from './planner'
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
