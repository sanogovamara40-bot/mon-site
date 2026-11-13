import { useEffect, useRef } from 'react'
import { dateKeyOf, dayOffset, formatTime } from '../lib/time'
import type { Column, Participant, WorkHours } from '../lib/planner'

type PlannerGridProps = {
  participants: Participant[]
  columns: Column[]
  work: WorkHours
  selectedHour: number
  best: { start: number; end: number } | null
  onSelectHour: (hour: number) => void
}

export function PlannerGrid({
  participants,
  columns,
  work,
  selectedHour,
  best,
  onSelectHour,
}: PlannerGridProps) {
  const anchorParts = columns[0].parts[0]
  const anchorDate = dateKeyOf(anchorParts)
  const startMinutes = work.start * 60
  const endMinutes = work.end * 60
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const ratio = (selectedHour + 0.5) / 24
    const target = ratio * element.scrollWidth - element.clientWidth / 2
    element.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [selectedHour])

  return (
    <div className="grid-scroll" ref={scrollRef}>
      <div className="grid" role="group" aria-label="Heures locales par participant">
        <div className="grid__corner">
          <span className="grid__corner-label">Heure locale</span>
          <span className="grid__corner-city">{participants[0]?.city}</span>
        </div>

        {columns.map((column) => {
          const isBest = best !== null && column.hour >= best.start && column.hour < best.end
          return (
            <div
              key={`head-${column.hour}`}
              className={[
                'grid__hour',
                isBest ? 'is-best' : '',
                column.hour === selectedHour ? 'is-selected' : '',
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
              const isSelected = column.hour === selectedHour

              return (
                <button
                  key={`${participant.zone}-${column.hour}`}
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
                    shift === 0 ? '' : shift > 0 ? ', le lendemain' : ', la veille'
                  }`}
                  onClick={() => onSelectHour(column.hour)}
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
