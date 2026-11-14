type IconProps = {
  className?: string
}

const strokeProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 9.5h17M8 3.5V6M16 3.5V6" />
    </svg>
  )
}

export function CalendarPlusIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 9.5h17M8 3.5V6M16 3.5V6M12 12.5v5M9.5 15h5" />
    </svg>
  )
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <path d="M12 15V3.5M12 3.5 8 7.5M12 3.5l4 4" />
      <path d="M5 12.5v5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-5" />
    </svg>
  )
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3h-6A3.5 3.5 0 0 0 3 6.5v6A2.5 2.5 0 0 0 5.5 15" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  )
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg {...strokeProps} className={className} aria-hidden="true">
      <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9L4.5 10.8 10.2 9 12 3.5Z" />
      <path d="M19 16.5v3M17.5 18h3" />
    </svg>
  )
}

export function BrandMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9.5" cy="12" r="5.4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="14.5" cy="12" r="5.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 10.2V12l1.3.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
