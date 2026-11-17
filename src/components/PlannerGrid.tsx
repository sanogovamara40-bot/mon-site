import { useEffect, useRef } from 'react'
import { dateKeyOf, dayOffset, dayShiftLabel, formatTime } from '../lib/time'
import type { Column, Participant, WorkHours } from '../lib/planner'

type PlannerGridProps = {
  participants: Participant[]
  columns: Column[]
  work: WorkHours
  selectedInstant: number
  best: { start: number; end: number } | null
  onSelectInstant: (instant: number) => void
}

export function PlannerGrid({
  participants,
  columns,
  work,
  selectedInstant,
  best,
  onSelectInstant,
}: PlannerGridProps) {
  const anchorParts = columns[0].parts[0]
  const anchorDate = dateKeyOf(anchorParts)
  const startMinutes = work.start * 60
  const endMinutes = work.end * 60
  const gridClass = `grid--${columns.length}`
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const index = columns.findIndex((column) => column.instant === selectedInstant)
    if (index < 0) return
    const ratio = (index + 0.5) / columns.length
    const target = ratio * element.scrollWidth - element.clientWidth / 2
    element.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [columns, selectedInstant])

  return (
    <div className="grid-scroll" ref={scrollRef}>
      <div className={`grid ${gridClass}`} role="group" aria-label="Heures locales par participant">
        <div className="grid__corner">
          <span className="grid__corner-label">Heure locale</span>
          <span className="grid__corner-city">{participants[0]?.city}</span>
        </div>

        {columns.map((column, index) => {
          const isBest = best !== null && index >= best.start && index < best.end
          return (
            <div
              key={`head-${column.instant}`}
              className={[
                'grid__hour',
                isBest ? 'is-best' : '',
                column.instant === selectedInstant ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {formatTime(column.parts[0])}
            </div>
          )
        })}

        {participants.map((participant, rowIndex) => (
          <div className="grid__row-contents" key={participant.zone}>
            <div className="grid__label">
              <span className="code-badge">{participant.countryCode}</span>
              <span className="grid__place">
                <span className="grid__city">{participant.city}</span>
                <span className="grid__country">{participant.country}</span>
              </span>
            </div>

            {columns.map((column) => {
              const part = column.parts[rowIndex]
              const minutes = part.hour * 60 + part.minute
              const inWork = minutes >= startMinutes && minutes < endMinutes
              const shift = dayOffset(anchorDate, dateKeyOf(part))
              const isSelected = column.instant === selectedInstant

              return (
                <button
                  key={`${participant.zone}-${column.instant}`}
                  type="button"
                  className={[
                    'cell',
                    inWork ? 'is-work' : '',
                    column.everyoneFree ? 'is-common' : '',
                    isSelected ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={isSelected}
                  aria-label={`${formatTime(part)} à ${participant.city}${
                    shift === 0 ? '' : `, ${dayShiftLabel(shift)}`
                  }`}
                  onClick={() => onSelectInstant(column.instant)}
                >
                  <span className="cell__time">{formatTime(part)}</span>
                  {shift !== 0 && (
                    <span className="cell__shift">
                      {shift > 0 ? '+' : '−'}
                      {Math.abs(shift)}j
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
