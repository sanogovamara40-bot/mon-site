import { describe, expect, it } from 'vitest'
import { buildIcs, escapeIcsText, foldIcsLine, icsFilename, meetingDescription } from './ics'

describe('escapeIcsText', () => {
  it('escapes separators and newlines', () => {
    expect(escapeIcsText('Paris, Londres; New York\nok')).toBe(
      'Paris\\, Londres\\; New York\\nok',
    )
  })

  it('escapes lone carriage returns so a title cannot break the ICS structure', () => {
    expect(escapeIcsText('Point\réquipe')).toBe('Point\\néquipe')
    expect(escapeIcsText('a\r\nb')).toBe('a\\nb')
  })
})

describe('foldIcsLine', () => {
  it('keeps short lines untouched', () => {
    expect(foldIcsLine('SUMMARY:Court')).toBe('SUMMARY:Court')
  })

  it('folds long lines under 75 bytes without splitting accents', () => {
    const line = `DESCRIPTION:${'é'.repeat(80)}`
    const folded = foldIcsLine(line)
    const lines = folded.split('\r\n')

    expect(lines.length).toBeGreaterThan(1)
    for (const part of lines) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75)
    }
    expect(folded.replace(/\r\n /g, '')).toBe(line)
  })
})

describe('buildIcs', () => {
  const start = Date.UTC(2026, 10, 14, 14, 0, 0)
  const end = Date.UTC(2026, 10, 14, 15, 0, 0)

  it('builds a valid UTC event', () => {
    const ics = buildIcs({
      start,
      end,
      title: 'Point équipe',
      description: '15:00 Paris\n14:00 Londres',
      url: 'https://unanime.app/?z=Europe%2FParis',
      uid: 'test-uid',
      now: Date.UTC(2026, 10, 13, 9, 30, 0),
    })

    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('UID:test-uid')
    expect(ics).toContain('DTSTAMP:20261113T093000Z')
    expect(ics).toContain('DTSTART:20261114T140000Z')
    expect(ics).toContain('DTEND:20261114T150000Z')
    expect(ics).toContain('SUMMARY:Point équipe')
    expect(ics).toContain('DESCRIPTION:15:00 Paris\\n14:00 Londres')
    expect(ics).toContain('URL:https://unanime.app/?z=Europe%2FParis')
    expect(ics).toContain('END:VEVENT')
  })

  it('neutralise toute injection de ligne via un titre hostile', () => {
    const ics = buildIcs({
      start,
      end,
      title: 'Point\rA\nB\r\nSUMMARY:Injecté',
      uid: 'safe-uid',
      now: Date.UTC(2026, 10, 13, 9, 30, 0),
    })

    const lines = ics.split('\r\n').filter(Boolean)

    // Aucun retour chariot isolé : tous les sauts sont des CRLF structurels.
    expect(ics).not.toMatch(/[^\r]\r[^\n]/)
    // Le titre ne peut créer ni propriété ni événement supplémentaire.
    expect(lines.filter((line) => line.startsWith('DTSTART:'))).toHaveLength(1)
    expect(lines.filter((line) => line.startsWith('SUMMARY:'))).toHaveLength(1)
    expect(lines.filter((line) => line.startsWith('BEGIN:VEVENT'))).toHaveLength(1)
    expect(lines).toContain('SUMMARY:Point\\nA\\nB\\nSUMMARY:Injecté')
    for (const line of lines) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    }
  })

  it('every line stays within 75 octets, even with a long title', () => {
    const ics = buildIcs({
      start,
      end,
      title: 'Réunion '.repeat(30),
      description: 'Un '.repeat(60),
    })

    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    }
  })
})

describe('meetingDescription', () => {
  it('mentions the real day shift of each local time', () => {
    const description = meetingDescription(
      '2026-11-13',
      [{ city: 'Paris' }, { city: 'Tokyo' }, { city: 'Kiritimati' }],
      [
        { year: 2026, month: 11, day: 13, hour: 23, minute: 0, weekday: 'Fri' },
        { year: 2026, month: 11, day: 14, hour: 6, minute: 0, weekday: 'Sat' },
        { year: 2026, month: 11, day: 11, hour: 23, minute: 0, weekday: 'Wed' },
      ],
    )

    expect(description).toContain('23h — Paris')
    expect(description).toContain('6h (+1 jour) — Tokyo')
    expect(description).toContain('23h (−2 jours) — Kiritimati')
  })
})

describe('buildIcs URL safety', () => {
  it('garde les virgules de l’URL de partage (propriété URI, pas TEXT)', () => {
    const url = 'https://unanime.app/?z=Europe%2FParis,America%2FNew_York&d=2026-11-14'
    const ics = buildIcs({
      start: Date.UTC(2026, 10, 14, 14),
      end: Date.UTC(2026, 10, 14, 15),
      title: 'Point',
      url,
      uid: 'uri-uid',
    })

    expect(ics).toContain(`URL:${url}`)
    expect(ics).not.toContain('\\,')
  })

  it('neutralises line injection through the shared URL', () => {
    const ics = buildIcs({
      start: Date.UTC(2026, 10, 14, 14),
      end: Date.UTC(2026, 10, 14, 15),
      title: 'Point',
      url: 'https://unanime.app/?z=Europe/Paris\r\nSUMMARY:Injecté',
      uid: 'safe-url',
      now: Date.UTC(2026, 10, 13, 9, 30),
    })

    expect(ics.split('\r\n').filter((line) => line.startsWith('SUMMARY:'))).toHaveLength(1)
    expect(ics).not.toMatch(/[^\r]\r[^\n]/)
  })
})

describe('icsFilename', () => {
  it('builds a readable filename', () => {
    expect(icsFilename('2026-11-14', 15, 0)).toBe('unanime-2026-11-14-15h00.ics')
  })
})
