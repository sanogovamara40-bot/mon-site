import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { buildColumns, spanAvailability } from '../lib/planner'
import type { Participant } from '../lib/planner'
import { SlotCard } from './SlotCard'

const paris: Participant = {
  zone: 'Europe/Paris',
  city: 'Paris',
  country: 'France',
  countryCode: 'FR',
}
const mumbai: Participant = {
  zone: 'Asia/Kolkata',
  city: 'Mumbai',
  country: 'Inde',
  countryCode: 'IN',
}

describe('SlotCard', () => {
  it('juge chaque ville sur toute la durée de la réunion', () => {
    const participants = [paris, mumbai]
    const work = { start: 9, end: 18 }
    const columns = buildColumns('2026-11-13', 'Europe/Paris', participants, work, 60)
    const column = columns.find(
      (candidate) => candidate.parts[1].hour === 17 && candidate.parts[1].minute === 30,
    )!
    const html = renderToStaticMarkup(
      createElement(SlotCard, {
        participants,
        column,
        availability: spanAvailability(columns, column, 60),
        dateKey: '2026-11-13',
        work,
        title: '',
        duration: 60,
        onCopy: () => {},
        onExport: () => {},
      }),
    )

    expect(html).toContain('<span class="pill pill--warn">1/2 dans les horaires</span>')
    expect(html.match(/slot__status is-ok/g)).toHaveLength(1)
    expect(html.match(/slot__status is-off/g)).toHaveLength(1)
  })
})
