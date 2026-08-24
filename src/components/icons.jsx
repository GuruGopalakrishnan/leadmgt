const common = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function DashboardIcon() {
  return (
    <svg {...common}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

export function LeadsIcon() {
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.8 5.5-5.8s5.5 2.5 5.5 5.8" />
      <path d="M16 4.3c1.5.5 2.5 1.9 2.5 3.5s-1 3-2.5 3.5" />
      <path d="M18.5 14.3c2 .6 3.5 2.6 3.5 5" />
    </svg>
  )
}

export function PipelineIcon() {
  return (
    <svg {...common}>
      <rect x="3" y="4" width="5" height="16" rx="1.2" />
      <rect x="9.5" y="4" width="5" height="10" rx="1.2" />
      <rect x="16" y="4" width="5" height="13" rx="1.2" />
    </svg>
  )
}

export function RowsIcon() {
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="5" rx="1.2" />
      <rect x="3" y="10.5" width="18" height="5" rx="1.2" />
      <rect x="3" y="17" width="18" height="3.5" rx="1.2" />
    </svg>
  )
}

export function FollowupsIcon() {
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  )
}

export function StagesIcon() {
  return (
    <svg {...common}>
      <path d="M12 3.5 21 8l-9 4.5L3 8Z" />
      <path d="M3 13l9 4.5L21 13" />
      <path d="M3 17.5 12 22l9-4.5" />
    </svg>
  )
}

export function BellIcon() {
  return (
    <svg {...common}>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path d="M9.5 17.5a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}
