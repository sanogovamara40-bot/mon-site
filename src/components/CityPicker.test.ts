import { describe, expect, it } from 'vitest'
import { nextActiveIndex } from './cityPickerKeys'

describe('nextActiveIndex', () => {
  it('highlights the first (or last) option when the list opens', () => {
    expect(nextActiveIndex('ArrowDown', 0, 5, false)).toBe(0)
    expect(nextActiveIndex('ArrowUp', 0, 5, false)).toBe(4)
  })

  it('cycles through the options once the list is open', () => {
    expect(nextActiveIndex('ArrowDown', 0, 5, true)).toBe(1)
    expect(nextActiveIndex('ArrowUp', 0, 5, true)).toBe(4)
    expect(nextActiveIndex('ArrowDown', 4, 5, true)).toBe(0)
  })

  it('stays at zero when there is no result', () => {
    expect(nextActiveIndex('ArrowDown', 0, 0, true)).toBe(0)
  })
})
