import { describe, expect, it } from 'vitest'
import { resolveWorkHours } from './settings'

const fallback = { start: 9, end: 18 }

describe('resolveWorkHours', () => {
  it('does not turn a missing start parameter into 00:00', () => {
    expect(resolveWorkHours(new URLSearchParams('?e=20'), null, fallback)).toEqual({
      start: 9,
      end: 20,
    })
    expect(resolveWorkHours(new URLSearchParams('?s=8'), null, fallback)).toEqual({
      start: 8,
      end: 18,
    })
  })

  it('uses both URL bounds when present', () => {
    expect(resolveWorkHours(new URLSearchParams('?s=8&e=20'), null, fallback)).toEqual({
      start: 8,
      end: 20,
    })
  })

  it('rejects invalid bounds and falls back to stored values', () => {
    expect(resolveWorkHours(new URLSearchParams('?s=20&e=8'), { start: 7, end: 19 }, fallback)).toEqual({
      start: 7,
      end: 19,
    })
    expect(resolveWorkHours(new URLSearchParams('?e=20'), { start: 7, end: 19 }, fallback)).toEqual({
      start: 7,
      end: 20,
    })
    expect(resolveWorkHours(new URLSearchParams(''), null, fallback)).toEqual(fallback)
  })
})
