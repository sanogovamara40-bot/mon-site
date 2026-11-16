import { describe, expect, it } from 'vitest'
import {
  dayOffset,
  formatDateLabel,
  formatTime,
  offsetLabel,
  shiftDateKey,
  todayKey,
  zoneParts,
  zonedTimeToUtc,
} from './time'

describe('zonedTimeToUtc', () => {
  it('converts summer and winter wall times', () => {
    expect(zonedTimeToUtc(2026, 7, 15, 15, 'Europe/Paris')).toBe(Date.UTC(2026, 6, 15, 13))
    expect(zonedTimeToUtc(2026, 1, 15, 15, 'Europe/Paris')).toBe(Date.UTC(2026, 0, 15, 14))
  })

  it('handles DST transitions', () => {
    // Spring forward: 03:00 in Paris is 01:00 UTC.
    expect(zonedTimeToUtc(2026, 3, 29, 3, 'Europe/Paris')).toBe(Date.UTC(2026, 2, 29, 1))
    // Fall back: 03:00 in Paris is 02:00 UTC.
    expect(zonedTimeToUtc(2026, 10, 25, 3, 'Europe/Paris')).toBe(Date.UTC(2026, 9, 25, 2))
  })

  it('handles half-hour offsets', () => {
    expect(zonedTimeToUtc(2026, 11, 13, 15, 'Asia/Kolkata')).toBe(
      Date.UTC(2026, 10, 13, 9, 30),
    )
  })
})

describe('offsetLabel', () => {
  const summer = Date.UTC(2026, 6, 15, 12)

  it('formats whole and fractional offsets', () => {
    expect(offsetLabel(summer, 'Europe/Paris')).toBe('UTC+2')
    expect(offsetLabel(summer, 'Asia/Kolkata')).toBe('UTC+5:30')
    expect(offsetLabel(summer, 'Pacific/Honolulu')).toBe('UTC−10')
    expect(offsetLabel(Date.UTC(2026, 0, 15, 12), 'Europe/London')).toBe('UTC')
  })
})

describe('zoneParts', () => {
  it('reads the wall clock in a zone', () => {
    const instant = Date.UTC(2026, 10, 13, 14, 30)
    expect(zoneParts(instant, 'Europe/Paris')).toMatchObject({ hour: 15, minute: 30, day: 13 })
    expect(zoneParts(instant, 'America/New_York')).toMatchObject({ hour: 9, minute: 30, day: 13 })
  })
})

describe('date helpers', () => {
  it('shifts across month and year boundaries', () => {
    expect(shiftDateKey('2026-12-31', 1)).toBe('2027-01-01')
    expect(shiftDateKey('2026-03-01', -1)).toBe('2026-02-28')
    expect(shiftDateKey('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('computes day offsets between calendar days', () => {
    expect(dayOffset('2026-11-13', '2026-11-14')).toBe(1)
    expect(dayOffset('2026-11-13', '2026-11-12')).toBe(-1)
    expect(dayOffset('2026-11-13', '2026-11-13')).toBe(0)
  })

  it('derives today from an instant in a zone', () => {
    const lateUtc = Date.UTC(2026, 10, 13, 23, 30)
    expect(todayKey('Europe/Paris', lateUtc)).toBe('2026-11-14')
    expect(todayKey('America/New_York', lateUtc)).toBe('2026-11-13')
  })
})

describe('formatTime', () => {
  it('omits minutes when they are zero', () => {
    expect(formatTime({ hour: 9, minute: 0 })).toBe('9h')
    expect(formatTime({ hour: 9, minute: 30 })).toBe('9h30')
  })
})

describe('offsetLabel', () => {
  it('ignores the seconds of the instant', () => {
    const winter = Date.UTC(2026, 10, 14, 12, 37, 42, 830)
    expect(offsetLabel(winter, 'Europe/Paris')).toBe('UTC+1')
    expect(offsetLabel(winter, 'America/New_York')).toBe('UTC−5')
    expect(offsetLabel(winter, 'Asia/Kolkata')).toBe('UTC+5:30')
  })

  it('follows daylight saving time', () => {
    expect(offsetLabel(Date.UTC(2026, 6, 14, 12, 0, 0), 'Europe/Paris')).toBe('UTC+2')
  })
})

describe('formatDateLabel', () => {
  it('uses « 1er » for the first day of the month', () => {
    expect(formatDateLabel('2027-01-01')).toBe('vendredi 1er janvier 2027')
    expect(formatDateLabel('2026-11-17')).toBe('mardi 17 novembre 2026')
  })
})
