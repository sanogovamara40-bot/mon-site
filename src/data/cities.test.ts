import { describe, expect, it } from 'vitest'
import { findCity, searchCities } from './cities'

describe('findCity', () => {
  it('prefers the canonical city for a shared zone', () => {
    expect(findCity('America/New_York')?.city).toBe('New York')
    expect(findCity('Europe/Rome')?.city).toBe('Rome')
    expect(findCity('Asia/Shanghai')?.city).toBe('Shanghai')
  })

  it('returns undefined for an unknown zone', () => {
    expect(findCity('Mars/Olympus')).toBeUndefined()
  })
})

describe('searchCities', () => {
  it('finds cities without accents and by country', () => {
    expect(searchCities('sao paulo')[0]?.city).toBe('São Paulo')
    expect(searchCities('japon').map((city) => city.city)).toContain('Tokyo')
    expect(searchCities('par')[0]?.city).toBe('Paris')
  })

  it('limits results', () => {
    expect(searchCities('', 3)).toHaveLength(3)
  })
})
