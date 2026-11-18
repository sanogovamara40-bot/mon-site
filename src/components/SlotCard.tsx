import {
  dateKeyOf,
  dayOffset,
  dayShiftLabel,
  formatDateLabel,
  formatTime,
  offsetLabel,
  zoneParts,
} from '../lib/time'
import { fitsWorkHours } from '../lib/planner'
import type { Column, Participant, WorkHours } from '../lib/planner'
import { CalendarPlusIcon, CopyIcon } from './Icons'

type SlotCardProps = {
  participants: Participant[]
  column: Column
  /** Participants within their working hours for the whole meeting, not just its start. */
  availability: number
  dateKey: string
  work: WorkHours
  title: string
  duration: number
  onCopy: () => void
  onExport: () => void
}

function durationLabel(minutes: number): string {
  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return hours === 1 ? '1 h' : `${hours} h`
  }
  return `${minutes} min`
}

export function SlotCard({
  participants,
  column,
  availability,
  dateKey,
  work,
  title,
  duration,
  onCopy,
  onExport,
}: SlotCardProps) {
  const anchorDate = dateKeyOf(column.parts[0])
  const endInstant = column.instant + duration * 60_000
  const everyoneAvailable = availability === participants.length
  const status = everyoneAvailable
    ? 'Tout le monde est disponible'
    : `${availability}/${participants.length} dans les horaires`

  return (
    <section className="slot" aria-label="Détail du créneau sélectionné">
      <div className="slot__head">
        <div>
          <p className="eyebrow">{title.trim() || 'Créneau sélectionné'}</p>
          <p className="slot__time">
            {formatTime(column.parts[0])}
            <span className="slot__zone"> à {participants[0]?.city}</span>
          </p>
          <p className="slot__date">
            {formatDateLabel(dateKey)} · {durationLabel(duration)}
          </p>
        </div>
        <span className={`pill ${everyoneAvailable ? 'pill--ok' : 'pill--warn'}`}>{status}</span>
      </div>

      <div className="slot__people">
        {participants.map((participant, index) => {
          const part = column.parts[index]
          const shift = dayOffset(anchorDate, dateKeyOf(part))
          const inWork = fitsWorkHours(part, zoneParts(endInstant, participant.zone), work)

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
                  {shift !== 0 && <span className="slot__day">{dayShiftLabel(shift)}</span>}
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
          Copiez le récapitulatif, ou ajoutez le créneau à votre agenda — l'invitation
          contient l'heure de chaque ville.
        </p>
        <div className="slot__buttons">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCopy}>
            <CopyIcon className="btn__icon" />
            Copier
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={onExport}>
            <CalendarPlusIcon className="btn__icon" />
            Ajouter à l'agenda · {durationLabel(duration)}
          </button>
        </div>
      </div>
    </section>
  )
}
