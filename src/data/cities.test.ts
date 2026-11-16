import { describe, expect, it } from 'vitest'
import { CITIES, findCity, searchCities } from './cities'

describe('findCity', () => {
  it('prefers the canonical city for a shared zone', () => {
    expect(findCity('America/New_York')?.city).toBe('New York')
    expect(findCity('Europe/Rome')?.city).toBe('Rome')
    expect(findCity('Asia/Shanghai')?.city).toBe('Shanghai')
  })

  it('returns undefined for an unknown zone', () => {
    expect(findCity('Mars/Olympus')).toBeUndefined()
  })

  it('has exactly one canonical city per zone', () => {
    const zones = new Map<string, number>()
    for (const city of CITIES) {
      if (city.primary) zones.set(city.zone, (zones.get(city.zone) ?? 0) + 1)
    }
    for (const [zone, count] of zones) {
      expect(count, `${zone} should have one primary city`).toBe(1)
    }
  })
})

describe('searchCities', () => {
  it('finds cities without accents and by country', () => {
    expect(searchCities('sao paulo')[0]?.city).toBe('São Paulo')
    expect(searchCities('japon').map((city) => city.city)).toContain('Tokyo')
    expect(searchCities('par')[0]?.city).toBe('Paris')
  })

  it('finds African and francophone cities', () => {
    expect(searchCities('abidjan')[0]?.city).toBe('Abidjan')
    expect(searchCities('côte d’ivoire')[0]?.city).toBe('Abidjan')
    expect(searchCities('dakar')[0]?.city).toBe('Dakar')
    expect(searchCities('montreal')[0]?.city).toBe('Montréal')
    expect(searchCities('yaounde')[0]?.city).toBe('Yaoundé')
  })

  it('limits results', () => {
    expect(searchCities('', 3)).toHaveLength(3)
  })
})
