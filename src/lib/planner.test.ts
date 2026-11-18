import { describe, expect, it } from 'vitest'
import {
  bestWindow,
  buildColumns,
  defaultHour,
  fitsWorkHours,
  leastConstrained,
  spanAvailability,
  suggestColumns,
} from './planner'
import type { Column } from './planner'
import type { Participant, WorkHours } from './planner'
import { zoneParts } from './time'

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
const mumbai: Participant = {
  city: 'Mumbai',
  country: 'Inde',
  countryCode: 'IN',
  zone: 'Asia/Kolkata',
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

  it('juge chaque ville sur sa propre date locale, pas sur celle de l’ancrage', () => {
    const lordHowe = {
      city: 'Lord Howe',
      country: 'Australie',
      countryCode: '··',
      zone: 'Australia/Lord_Howe',
    }
    const columns = buildColumns('2026-04-05', lordHowe.zone, [lordHowe, newYork], officeHours)
    const column = columns.find(
      (entry) => entry.parts[0].hour === 8 && entry.parts[0].minute === 30,
    )

    // À 8h30 à Lord Howe, New York est à 18h la veille : ni l'un ni l'autre
    // n'est disponible, mais l'écart aux horaires reste minime (30 min + 1 min).
    expect(column).toBeDefined()
    expect(column!.parts[1]).toMatchObject({ day: 4, hour: 18, minute: 0 })
    expect(column!.penalty).toBe(31)
    expect(leastConstrained(columns).instant).toBe(column!.instant)
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

describe('durée de la réunion et décalage à la demi-heure', () => {
  const work: WorkHours = { start: 9, end: 18 }
  const dateKey = '2026-11-13'
  const columns = buildColumns(dateKey, 'Europe/Paris', [paris, mumbai], work, 60)
  const at = (hour: number, minute: number) =>
    columns.find(
      (column) => column.parts[1].hour === hour && column.parts[1].minute === minute,
    )!

  it('ne déclare pas disponible une réunion qui dépasse la fin des horaires', () => {
    const late = at(17, 30) // 17:30 → 18:30 à Mumbai, bureau fermé à 18h.

    expect(late.parts[0]).toMatchObject({ hour: 13, minute: 0 })
    expect(late.available).toBe(1)
    expect(late.everyoneFree).toBe(false)
    expect(late.penalty).toBe(30)
    expect(spanAvailability(columns, late, 60)).toBe(1)
    expect(bestWindow(columns, 60)).toEqual({ start: 9, end: 13 })
  })

  it('accepte une réunion qui se termine exactement à la fermeture', () => {
    const fits = at(16, 30) // 16:30 → 17:30 à Mumbai.

    expect(fits.available).toBe(2)
    expect(fits.everyoneFree).toBe(true)
    expect(fits.penalty).toBe(0)
    expect(
      fitsWorkHours(fits.parts[1], zoneParts(fits.instant + 60 * 60_000, mumbai.zone), work),
    ).toBe(true)
  })

  it('garde une journée complète disponible après minuit local', () => {
    const fullDay = buildColumns(
      dateKey,
      'Europe/Paris',
      [paris, mumbai],
      { start: 0, end: 24 },
      60,
    )
    const overnight = fullDay.find(
      (column) => column.parts[1].hour === 23 && column.parts[1].minute === 30,
    )!

    expect(overnight.parts[1]).toMatchObject({ hour: 23, minute: 30 })
    expect(overnight.available).toBe(2)
    expect(overnight.penalty).toBe(0)
    expect(overnight.everyoneFree).toBe(true)
  })
})

describe('durée de la réunion', () => {
  it('n’annonce un recouvrement que s’il contient toute la durée', () => {
    const columnsFor = (duration: number) =>
      buildColumns('2026-11-13', 'Europe/Paris', [paris, tokyo], officeHours, duration)

    expect(bestWindow(columnsFor(60), 60)).toEqual({ start: 9, end: 10 })
    expect(bestWindow(columnsFor(90), 90)).toBeNull()
    expect(bestWindow(columnsFor(30), 30)).toEqual({ start: 9, end: 10 })
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
    expect(spanAvailability(columns, columns[0], 90)).toBe(1)
    expect(spanAvailability(columns, columns[2], 90)).toBe(1)
    expect(spanAvailability(columns, columns[3], 90)).toBe(1)
    expect(spanAvailability(columns, columns[1], 90)).toBe(0)
    expect(spanAvailability(columns, columns[3], 0)).toBe(0)
    expect(suggestColumns(columns, 1, 90)[0].hour).toBe(2)
  })

  it('reconnaît une fenêtre de 90 minutes tenant dans une seule colonne', () => {
    const columns = buildColumns('2026-11-13', 'Europe/Paris', [paris], { start: 9, end: 11 }, 90)

    expect(columns.find((column) => column.hour === 9)!.everyoneFree).toBe(true)
    expect(bestWindow(columns, 90)).toEqual({ start: 9, end: 10 })
    expect(defaultHour(columns, 90)).toBe(9)
  })

  it('ne sous-estime pas la disponibilité d’un créneau déjà jugé sur toute la durée', () => {
    const columns = buildColumns('2026-11-13', 'Europe/Paris', [paris], { start: 9, end: 11 }, 90)
    const slot = columns.find((column) => column.hour === 9)!

    expect(slot.available).toBe(1)
    expect(spanAvailability(columns, slot, 90)).toBe(1)
  })

  it('garde le créneau par défaut dans la fenêtre commune pour 90 minutes', () => {
    const columns = buildColumns(
      '2026-11-13',
      'Europe/Paris',
      [paris, london, newYork],
      officeHours,
      90,
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
