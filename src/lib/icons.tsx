import React from 'react'

interface IconProps {
  size?: number
  color?: string
  className?: string
}

const base = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24' as const,
  fill: 'none',
  stroke: color,
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function IconDashboard({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <rect x="3" y="3" width="8" height="10" rx="1.5" />
      <rect x="13" y="3" width="8" height="6" rx="1.5" />
      <rect x="13" y="11" width="8" height="10" rx="1.5" />
      <rect x="3" y="15" width="8" height="6" rx="1.5" />
    </svg>
  )
}

export function IconCalendar({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconUpload({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  )
}

export function IconMessage({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M21 12a8 8 0 0 1-12.3 6.7L3 20l1.3-5.7A8 8 0 1 1 21 12z" />
    </svg>
  )
}

export function IconGroups({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" />
      <path d="M14 19c0-2 1.5-4 4-4s3.5 1.5 3.5 4" />
    </svg>
  )
}

export function IconHistory({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 8v5l3 2" />
    </svg>
  )
}

export function IconSettings({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  )
}

export function IconSend({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

export function IconCheck({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M5 12l5 5 9-11" />
    </svg>
  )
}

export function IconX({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconPlus({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconPencil({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

export function IconTrash({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  )
}

export function IconEye({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconArrowRight({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

export function IconChevronRight({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function IconChevronLeft({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function IconClock({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function IconFlash({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
    </svg>
  )
}

export function IconLogout({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

export function IconFile({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

export function IconWifi({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M1 6.5C3.5 4 6 2.5 8 2.5s4.5 1.5 7 4" />
      <circle cx="8" cy="9" r="1.2" fill={color} stroke="none" />
    </svg>
  )
}

export function IconBattery({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 14 11" fill="none" className={className}>
      <rect x="1" y="2" width="9" height="7" rx="1.5" stroke={color} strokeWidth="1" />
      <rect x="2.5" y="3.5" width="6" height="4" rx="0.5" fill={color} />
      <rect x="11" y="4.5" width="2" height="2" fill={color} />
    </svg>
  )
}

export function IconSearch({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

export function IconMore({ size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className} fill={color} stroke="none">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  )
}

export function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2a8.8 8.8 0 0 0-.14-1.59H9v3.02h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.4z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.87-3.05.87-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

export type IconName =
  | 'dashboard' | 'calendar' | 'upload' | 'message' | 'groups'
  | 'history' | 'settings' | 'send' | 'check' | 'x' | 'plus'
  | 'pencil' | 'trash' | 'eye' | 'arrowRight' | 'chevronRight'
  | 'chevronLeft' | 'clock' | 'flash' | 'logout' | 'file' | 'search' | 'more'

export function Icon({ name, size = 16, color = 'currentColor', className }: { name: IconName } & IconProps) {
  const props = { size, color, className }
  switch (name) {
    case 'dashboard': return <IconDashboard {...props} />
    case 'calendar': return <IconCalendar {...props} />
    case 'upload': return <IconUpload {...props} />
    case 'message': return <IconMessage {...props} />
    case 'groups': return <IconGroups {...props} />
    case 'history': return <IconHistory {...props} />
    case 'settings': return <IconSettings {...props} />
    case 'send': return <IconSend {...props} />
    case 'check': return <IconCheck {...props} />
    case 'x': return <IconX {...props} />
    case 'plus': return <IconPlus {...props} />
    case 'pencil': return <IconPencil {...props} />
    case 'trash': return <IconTrash {...props} />
    case 'eye': return <IconEye {...props} />
    case 'arrowRight': return <IconArrowRight {...props} />
    case 'chevronRight': return <IconChevronRight {...props} />
    case 'chevronLeft': return <IconChevronLeft {...props} />
    case 'clock': return <IconClock {...props} />
    case 'flash': return <IconFlash {...props} />
    case 'logout': return <IconLogout {...props} />
    case 'file': return <IconFile {...props} />
    case 'search': return <IconSearch {...props} />
    case 'more': return <IconMore {...props} />
    default: return <IconDashboard {...props} />
  }
}
