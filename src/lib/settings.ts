import type { WorkHours } from './planner'

export function sanitizeWork(start: number, end: number): WorkHours | null {
  if (!Number.isInteger(start) || !Number.isInteger(end)) return null
  if (start < 0 || end > 24 || start >= end) return null
  return { start, end }
}

/**
 * A missing URL parameter must not be read as 0: `Number(null) === 0` would turn
 * a link carrying only `e` into a 00:00–20:00 working day. Partial links keep
 * the other bound from storage or defaults.
 */
export function resolveWorkHours(
  params: URLSearchParams,
  stored: WorkHours | null,
  fallback: WorkHours,
): WorkHours {
  const base = (stored ? sanitizeWork(stored.start, stored.end) : null) ?? fallback
  const bound = (name: string, defaultValue: number): number => {
    const value = params.get(name)
    return value !== null && value.trim() !== '' ? Number(value) : defaultValue
  }
  return (
    sanitizeWork(bound('s', base.start), bound('e', base.end)) ?? base
  )
}
