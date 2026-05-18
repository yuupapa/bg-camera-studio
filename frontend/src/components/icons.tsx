import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = (p: P) => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
})

export const BrushIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9.5 14.5 3 21" />
    <path d="M14 4.5a3 3 0 0 1 4.5 4L11 16l-4 1 1-4 6-8.5Z" />
  </svg>
)

export const HandIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
    <path d="M14 10V4a2 2 0 0 0-4 0v7" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-7.4-4.9L3 14.5a2 2 0 0 1 3.5-2L8 14" />
  </svg>
)

export const RotateIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18" />
    <path d="M3 12h18" />
  </svg>
)

export const TiltIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 12h20" />
    <path d="M5 8l14 8" />
    <path d="M12 2v4M12 18v4" />
    <path d="M4.5 16.5l2-1M17.5 7.5l2-1" />
  </svg>
)

export const ZoomIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
    <path d="M11 8v6M8 11h6" />
  </svg>
)

export const UndoIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
  </svg>
)

export const RedoIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9a5 5 0 0 0 0 10h4" />
  </svg>
)

export const SunIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const HelpIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5" />
    <path d="M12 17h.01" />
  </svg>
)

export const BellIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
)

export const ImageIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m21 16-5-5-9 9" />
  </svg>
)

export const DownloadCloudIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 8.5a3.5 3.5 0 0 1 .5 6.96" />
    <path d="M12 12v8M8.5 16.5 12 20l3.5-3.5" />
  </svg>
)

export const CubeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
    <path d="M3 7l9 5 9-5M12 12v10" />
  </svg>
)

export const GlobeIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
)

export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const ChevronDownIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const TextIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 5h14M12 5v14M9 19h6" />
  </svg>
)

export const EraserIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 20H5l-2-2a2 2 0 0 1 0-3l9-9 6 6-7 7" />
    <path d="m14 8 4 4" />
  </svg>
)

export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
)

export const InfoIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)
