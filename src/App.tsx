import { useEffect, useMemo, useState } from 'react'
import { CityPicker } from './components/CityPicker'
import { PlannerGrid } from './components/PlannerGrid'
import { SlotCard } from './components/SlotCard'
import {
  BrandMark,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  ShareIcon,
  SparkIcon,
} from './components/Icons'
import { findCity } from './data/cities'
import type { City } from './data/cities'
import { buildIcs, downloadIcs, icsFilename } from './lib/ics'
import { bestWindow, buildColumns, defaultHour, leastConstrained, suggestColumns } from './lib/planner'
import type { Participant, WorkHours } from './lib/planner'
import {
  formatDateLabel,
  formatTime,
  offsetLabel,
  shiftDateKey,
  todayKey,
  zoneParts,
} from './lib/time'
import './App.css'

const DEFAULT_ZONES = ['Europe/Paris', 'Europe/London', 'America/New_York']
const DEFAULT_WORK: WorkHours = { start: 9, end: 18 }
const DEFAULT_DURATION = 60
const DURATIONS = [30, 45, 60, 90]
const STORAGE_KEY = 'unanime:v1'

type Stored = {
  zones: string[]
  start: number
  end: number
  title?: string
  duration?: number
}

function isValidZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

function isValidDateKey(key: string | null): key is string {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function sanitizeWork(start: number, end: number): WorkHours | null {
  if (!Number.isInteger(start) || !Number.isInteger(end)) return null
  if (start < 0 || end > 24 || start >= end) return null
  return { start, end }
}

function sanitizeTitle(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 80) : ''
}

function sanitizeDuration(value: unknown): number {
  const duration = Number(value)
  return DURATIONS.includes(duration) ? duration : DEFAULT_DURATION
}

function cityForZone(zone: string): Participant {
  return (
    findCity(zone) ?? {
      city: zone.split('/').pop()?.replaceAll('_', ' ') ?? zone,
      country: zone,
      countryCode: '··',
      zone,
    }
  )
}

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<Stored>
    if (!Array.isArray(value.zones)) return null
    const zones = value.zones.filter(
      (zone): zone is string => typeof zone === 'string' && isValidZone(zone),
    )
    if (zones.length === 0) return null
    const work = sanitizeWork(Number(value.start), Number(value.end))
    return {
      zones,
      start: work?.start ?? DEFAULT_WORK.start,
      end: work?.end ?? DEFAULT_WORK.end,
      title: sanitizeTitle(value.title),
      duration: sanitizeDuration(value.duration),
    }
  } catch {
    return null
  }
}

type Boot = {
  participants: Participant[]
  work: WorkHours
  dateKey: string
  title: string
  duration: number
}

function readBoot(): Boot {
  const params = new URLSearchParams(window.location.search)
  const stored = readStored()

  const urlZones = (params.get('z') ?? '')
    .split(',')
    .map((zone) => zone.trim())
    .filter((zone) => zone.length > 0 && isValidZone(zone))

  const sourceZones =
    urlZones.length > 0 ? urlZones : stored?.zones.length ? stored.zones : DEFAULT_ZONES
  const zones = sourceZones.filter((zone, index) => sourceZones.indexOf(zone) === index)

  const participants = zones.map(cityForZone)
  const work =
    sanitizeWork(Number(params.get('s')), Number(params.get('e'))) ??
    (stored ? sanitizeWork(stored.start, stored.end) : null) ??
    DEFAULT_WORK

  const anchorZone = participants[0]?.zone ?? 'Europe/Paris'
  const dateParam = params.get('d')

  return {
    participants: participants.length > 0 ? participants : DEFAULT_ZONES.map(cityForZone),
    work,
    dateKey: isValidDateKey(dateParam) ? dateParam : todayKey(anchorZone),
    title: sanitizeTitle(params.get('n') ?? stored?.title),
    duration: sanitizeDuration(params.get('dur') ?? stored?.duration),
  }
}

const boot = readBoot()

const formatHourOption = (hour: number) => `${String(hour).padStart(2, '0')}:00`

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the legacy path below.
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.className = 'clipboard-helper'
    document.body.appendChild(area)
    area.select()
    const copied = document.execCommand('copy')
    area.remove()
    return copied
  } catch {
    return false
  }
}

function App() {
  const [participants, setParticipants] = useState<Participant[]>(boot.participants)
  const [work, setWork] = useState<WorkHours>(boot.work)
  const [dateKey, setDateKey] = useState(boot.dateKey)
  const [title, setTitle] = useState(boot.title)
  const [duration, setDuration] = useState(boot.duration)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          zones: participants.map((participant) => participant.zone),
          start: work.start,
          end: work.end,
          title,
          duration,
        }),
      )
    } catch {
      // Storage can be unavailable (private mode, quota); the app still works.
    }
  }, [participants, work, title, duration])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('z', participants.map((participant) => participant.zone).join(','))
    params.set('d', dateKey)
    params.set('s', String(work.start))
    params.set('e', String(work.end))
    if (title) params.set('n', title)
    params.set('dur', String(duration))
    const nextUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState(null, '', nextUrl)
  }, [participants, work, dateKey, title, duration])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const anchor = participants[0] ?? cityForZone('Europe/Paris')
  const columns = useMemo(
    () => buildColumns(dateKey, anchor.zone, participants, work),
    [dateKey, anchor.zone, participants, work],
  )
  const best = useMemo(() => bestWindow(columns), [columns])
  const autoHour = useMemo(() => defaultHour(columns), [columns])
  const effectiveHour =
    selectedHour !== null && columns.some((column) => column.hour === selectedHour)
      ? selectedHour
      : autoHour
  const selected = columns.find((column) => column.hour === effectiveHour) ?? columns[0]
  const suggestions = useMemo(() => suggestColumns(columns), [columns])
  const fallback = useMemo(() => leastConstrained(columns), [columns])

  const addParticipant = (city: City) => {
    setParticipants((current) =>
      current.some((participant) => participant.zone === city.zone) ? current : [...current, city],
    )
    setSelectedHour(null)
  }

  const removeParticipant = (zone: string) => {
    setParticipants((current) =>
      current.length <= 1 ? current : current.filter((participant) => participant.zone !== zone),
    )
    setSelectedHour(null)
  }

  const updateStart = (value: number) => {
    const start = Math.min(Math.max(value, 0), 23)
    setWork({ start, end: Math.max(work.end, start + 1) })
    setSelectedHour(null)
  }

  const updateEnd = (value: number) => {
    const end = Math.min(Math.max(value, 1), 24)
    setWork({ start: Math.min(work.start, end - 1), end })
    setSelectedHour(null)
  }

  const changeDate = (nextDate: string) => {
    setDateKey(nextDate)
    setSelectedHour(null)
  }

  const share = async () => {
    const copied = await copyText(window.location.href)
    setToast(copied ? 'Lien copié — le planning est dedans.' : 'Copie impossible dans ce navigateur.')
  }

  const copySummary = async () => {
    const summary = [
      `${title.trim() || 'Réunion'} — ${formatDateLabel(dateKey)}, ${formatTime(selected.parts[0])} (${participants[0]?.city})`,
      ...participants.map(
        (participant, index) => `${formatTime(selected.parts[index])} ${participant.city}`,
      ),
    ].join(' · ')
    const copied = await copyText(summary)
    setToast(copied ? 'Récapitulatif copié.' : 'Copie impossible dans ce navigateur.')
  }

  const exportIcs = () => {
    const start = selected.instant
    const end = start + duration * 60_000
    const description = [
      formatDateLabel(dateKey),
      ...participants.map(
        (participant, index) =>
          `${formatTime(selected.parts[index])} — ${participant.city}`,
      ),
      '',
      'Créé avec Unanime',
    ].join('\n')

    const content = buildIcs({
      start,
      end,
      title: title.trim() || 'Réunion',
      description,
      url: window.location.href,
    })

    downloadIcs(icsFilename(dateKey, selected.parts[0].hour, selected.parts[0].minute), content)
    setToast('Agenda téléchargé — ouvrez le fichier .ics pour l’ajouter.')
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand">
          <span className="brand__mark">
            <BrandMark className="brand__icon" />
          </span>
          <div className="brand__text">
            <h1 className="brand__name">Unanime</h1>
            <p className="brand__tagline">Trouvez l'heure qui arrange tout le monde.</p>
          </div>
        </div>

        <div className="site-header__actions">
          <span className="save-note">Sauvegardé dans ce navigateur</span>
          <button type="button" className="btn btn--primary" onClick={share}>
            <ShareIcon className="btn__icon" />
            Partager
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="panel controls">
          <div className="controls__people">
            <div className="panel__head">
              <h2>Participants</h2>
              <span className="count">{participants.length}</span>
              <span className="controls__spacer" />
              <span className="controls__note">Données locales</span>
            </div>

            <div className="people-row">
              <ul className="people">
                {participants.map((participant) => (
                  <li className="person" key={participant.zone}>
                    <span className="code-badge">{participant.countryCode}</span>
                    <span className="person__place">
                      <span className="person__city">{participant.city}</span>
                      <span className="person__meta">
                        {participant.country} · {offsetLabel(now, participant.zone)}
                      </span>
                    </span>
                    <span className="person__time">
                      {formatTime(zoneParts(now, participant.zone))}
                    </span>
                    <button
                      type="button"
                      className="person__remove"
                      aria-label={`Retirer ${participant.city}`}
                      onClick={() => removeParticipant(participant.zone)}
                      disabled={participants.length <= 1}
                    >
                      <CloseIcon className="person__remove-icon" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="people-row__picker">
                <CityPicker
                  selectedZones={participants.map((participant) => participant.zone)}
                  now={now}
                  onSelect={addParticipant}
                />
              </div>
            </div>
          </div>

          <div className="controls__hours">
            <div className="panel__head">
              <h2>Horaires de bureau</h2>
            </div>
            <div className="hours">
              <label className="hours__field">
                <span>De</span>
                <select
                  value={work.start}
                  aria-label="Début des horaires de bureau"
                  onChange={(event) => updateStart(Number(event.target.value))}
                >
                  {Array.from({ length: 24 }, (_, hour) => (
                    <option key={hour} value={hour}>
                      {formatHourOption(hour)}
                    </option>
                  ))}
                </select>
              </label>
              <span className="hours__arrow" aria-hidden="true">
                →
              </span>
              <label className="hours__field">
                <span>à</span>
                <select
                  value={work.end}
                  aria-label="Fin des horaires de bureau"
                  onChange={(event) => updateEnd(Number(event.target.value))}
                >
                  {Array.from({ length: 24 }, (_, index) => index + 1).map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHourOption(hour)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="hint">Appliqué à tous, dans l'heure locale de chaque ville.</p>
          </div>

          <div className="controls__meeting">
            <div className="panel__head">
              <h2>Réunion</h2>
            </div>
            <input
              className="meeting__name"
              type="text"
              value={title}
              maxLength={80}
              placeholder="Ex. Point d'équipe"
              aria-label="Nom de la réunion"
              onChange={(event) => setTitle(event.target.value)}
            />
            <label className="hours__field meeting__duration">
              <span>Durée</span>
              <select
                value={duration}
                aria-label="Durée de la réunion"
                onChange={(event) => setDuration(sanitizeDuration(event.target.value))}
              >
                {DURATIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes % 60 === 0
                      ? `${minutes / 60} h${minutes > 60 ? ' ' : ''}`
                      : `${minutes} min`}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="panel board">
          <div className="datebar">
            <div className="date-nav">
              <button
                type="button"
                className="btn btn--icon"
                aria-label="Jour précédent"
                onClick={() => changeDate(shiftDateKey(dateKey, -1))}
              >
                <ChevronLeftIcon className="btn__icon" />
              </button>

              <label className="date-field">
                <CalendarIcon className="date-field__icon" />
                <span className="date-field__text">{formatDateLabel(dateKey)}</span>
                <input
                  className="date-field__input"
                  type="date"
                  value={dateKey}
                  aria-label="Choisir la date de la réunion"
                  onChange={(event) => {
                    if (isValidDateKey(event.target.value)) changeDate(event.target.value)
                  }}
                />
              </label>

              <button
                type="button"
                className="btn btn--icon"
                aria-label="Jour suivant"
                onClick={() => changeDate(shiftDateKey(dateKey, 1))}
              >
                <ChevronRightIcon className="btn__icon" />
              </button>
            </div>

            <div className="datebar__side">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => changeDate(todayKey(anchor.zone))}
              >
                Aujourd'hui
              </button>
              <span className="datebar__note">
                Heures affichées à <strong>{anchor.city}</strong>
              </span>
            </div>
          </div>

          {best ? (
            <div className="best">
              <span className="best__icon">
                <SparkIcon />
              </span>
              <div className="best__body">
                <p className="eyebrow">Meilleur créneau</p>
                <p className="best__value">
                  {best.start}h – {best.end}h <span>à {anchor.city}</span>
                </p>
                <p className="best__hint">Tout le monde est dans ses horaires de bureau.</p>
              </div>
              <span className="pill pill--ok">{best.end - best.start} h de recouvrement</span>
            </div>
          ) : (
            <div className="best best--none">
              <span className="best__icon">
                <SparkIcon />
              </span>
              <div className="best__body">
                <p className="eyebrow">Pas de recouvrement parfait</p>
                <p className="best__value">
                  Le moins contraignant : {fallback.hour}h <span>à {anchor.city}</span>
                </p>
                <p className="best__hint">
                  Aucune heure ne tombe dans toutes les plages de bureau — ces suggestions
                  minimisent le décalage.
                </p>
              </div>
              <span className="pill pill--warn">
                {fallback.available}/{participants.length} dispo
              </span>
            </div>
          )}

          <div className="suggestions" aria-label="Créneaux suggérés">
            <span className="suggestions__label">Suggestions</span>
            {suggestions.map((column) => (
              <button
                key={column.hour}
                type="button"
                className={`suggestion ${column.hour === effectiveHour ? 'is-active' : ''}`}
                aria-pressed={column.hour === effectiveHour}
                onClick={() => setSelectedHour(column.hour)}
              >
                <span className="suggestion__time">{formatTime(column.parts[0])}</span>
                <span className="suggestion__meta">
                  {column.everyoneFree ? 'tout le monde' : `${column.available}/${participants.length} dispo`}
                </span>
              </button>
            ))}
          </div>

          <PlannerGrid
            participants={participants}
            columns={columns}
            work={work}
            selectedHour={effectiveHour}
            best={best}
            onSelectHour={setSelectedHour}
          />

          <div className="legend">
            <span className="legend__item">
              <i className="legend__swatch is-work" />
              Dans les horaires
            </span>
            <span className="legend__item">
              <i className="legend__swatch is-common" />
              Tout le monde dispo
            </span>
            <span className="legend__item">
              <i className="legend__swatch is-off" />
              Hors horaires
            </span>
            <span className="legend__hint">Cliquez sur une heure pour comparer les villes.</span>
          </div>

          <SlotCard
            participants={participants}
            column={selected}
            dateKey={dateKey}
            work={work}
            title={title}
            duration={duration}
            onCopy={copySummary}
            onExport={exportIcs}
          />
        </section>
      </main>

      <footer className="site-footer">
        <span>Unanime · la réunion qui tombe juste, pour tout le monde.</span>
        <span><a href="/offre">Offre équipe</a> · <a href="/legal">Mentions légales</a></span>
      </footer>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
