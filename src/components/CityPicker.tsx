import { useEffect, useMemo, useRef, useState } from 'react'
import { searchCities } from '../data/cities'
import type { City } from '../data/cities'
import { offsetLabel } from '../lib/time'
import { CheckIcon, SearchIcon } from './Icons'

type CityPickerProps = {
  selectedZones: string[]
  now: number
  onSelect: (city: City) => void
}

export function CityPicker({ selectedZones, now, onSelect }: CityPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => searchCities(query), [query])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const choose = (city: City) => {
    if (selectedZones.includes(city.zone)) return
    onSelect(city)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      if (results.length) setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (results.length) setActiveIndex((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const city = results[Math.min(activeIndex, results.length - 1)]
      if (city) choose(city)
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="picker" ref={wrapRef}>
      <SearchIcon className="picker__icon" />
      <input
        ref={inputRef}
        id="city-search"
        className="picker__input"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="city-listbox"
        aria-autocomplete="list"
        aria-label="Ajouter une ville"
        placeholder="Ajouter une ville…"
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
          setOpen(true)
        }}
        onFocus={() => {
          setActiveIndex(0)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <ul className="picker__menu" id="city-listbox" role="listbox" aria-label="Villes">
          {results.length === 0 && <li className="picker__empty">Aucune ville trouvée.</li>}
          {results.map((city, index) => {
            const alreadyAdded = selectedZones.includes(city.zone)
            return (
              <li
                key={`${city.zone}-${city.city}`}
                role="option"
                aria-selected={index === activeIndex}
                aria-disabled={alreadyAdded}
                className={[
                  'picker__option',
                  index === activeIndex ? 'is-active' : '',
                  alreadyAdded ? 'is-added' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(city)}
              >
                <span className="code-badge">{city.countryCode}</span>
                <span className="picker__place">
                  <span className="picker__city">{city.city}</span>
                  <span className="picker__country">{city.country}</span>
                </span>
                <span className="picker__meta">
                  {offsetLabel(now, city.zone)}
                  {alreadyAdded && <CheckIcon className="picker__check" />}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
