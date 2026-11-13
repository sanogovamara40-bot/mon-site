import { dateKeyOf, dayOffset, formatDateLabel, formatTime, offsetLabel } from '../lib/time'
import type { Column, Participant, WorkHours } from '../lib/planner'
import { CopyIcon } from './Icons'

type SlotCardProps = {
  participants: Participant[]
  column: Column
  dateKey: string
  work: WorkHours
  onCopy: () => void
}

export function SlotCard({ participants, column, dateKey, work, onCopy }: SlotCardProps) {
  const anchorDate = dateKeyOf(column.parts[0])
  const status = column.everyoneFree
    ? 'Tout le monde est disponible'
    : `${column.available}/${participants.length} dans les horaires`

  return (
    <section className="slot" aria-label="Détail du créneau sélectionné">
      <div className="slot__head">
        <div>
          <p className="eyebrow">Créneau sélectionné</p>
          <p className="slot__time">
            {formatTime(column.parts[0])}
            <span className="slot__zone"> à {participants[0]?.city}</span>
          </p>
          <p className="slot__date">{formatDateLabel(dateKey)}</p>
        </div>
        <span className={`pill ${column.everyoneFree ? 'pill--ok' : 'pill--warn'}`}>{status}</span>
      </div>

      <div className="slot__people">
        {participants.map((participant, index) => {
          const part = column.parts[index]
          const shift = dayOffset(anchorDate, dateKeyOf(part))
          const minutes = part.hour * 60 + part.minute
          const inWork = minutes >= work.start * 60 && minutes < work.end * 60

          return (
            <div className="slot__person" key={participant.zone}>
              <div className="slot__person-top">
                <span className="code-badge code-badge--sm">{participant.countryCode}</span>
                <span className="slot__city">{participant.city}</span>
                <span className="slot__offset">{offsetLabel(column.instant, participant.zone)}</span>
              </div>
              <div className="slot__person-bottom">
                <span className="slot__local">
                  {formatTime(part)}
                  {shift !== 0 && (
                    <span className="slot__day">
                      {shift > 0 ? '+1 jour' : '−1 jour'}
                    </span>
                  )}
                </span>
                <span className={`slot__status ${inWork ? 'is-ok' : 'is-off'}`}>
                  {inWork ? 'Dans les horaires' : 'Hors horaires'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="slot__actions">
        <p className="slot__hint">
          Cliquez sur une autre heure de la grille pour comparer, ou copiez ce récapitulatif.
        </p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCopy}>
          <CopyIcon className="btn__icon" />
          Copier le récapitulatif
        </button>
      </div>
    </section>
  )
}
