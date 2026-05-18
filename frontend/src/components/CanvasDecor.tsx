import { useStudioStore } from '../store'
import { useT } from '../i18n'
import { InfoIcon } from './icons'

// Purely decorative space backdrop shown behind the (transparent) Three.js
// canvas. Visible in the empty state; a loaded panorama sphere covers it.
export default function CanvasDecor() {
  const t = useT()
  const hasImage = useStudioStore((s) => s.panoramaImageUrl !== null)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Aurora / nebula glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 8%, rgba(124,58,237,0.30) 0%, rgba(124,58,237,0) 60%),' +
            'radial-gradient(45% 40% at 88% 22%, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0) 65%),' +
            'radial-gradient(70% 60% at 20% 95%, rgba(99,102,241,0.20) 0%, rgba(99,102,241,0) 60%)',
        }}
      />

      {/* Concentric platform grid (bottom) */}
      <svg
        className="absolute left-1/2 -translate-x-1/2 opacity-[0.5]"
        style={{ bottom: '-22%', width: '120%', height: '70%' }}
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
      >
        <defs>
          <radialGradient id="ringFade" cx="50%" cy="100%" r="75%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[120, 220, 330, 450, 580].map((r) => (
          <ellipse
            key={r}
            cx="600"
            cy="700"
            rx={r * 1.7}
            ry={r * 0.62}
            stroke="url(#ringFade)"
            strokeWidth="1.5"
          />
        ))}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (Math.PI * i) / 15
          const x = 600 + Math.cos(a) * 1000
          const y = 700 - Math.sin(a) * 380
          return (
            <line
              key={i}
              x1="600"
              y1="700"
              x2={x}
              y2={y}
              stroke="url(#ringFade)"
              strokeWidth="1"
            />
          )
        })}
      </svg>

      {/* Viewfinder corner brackets */}
      {(
        [
          'top-5 left-5 border-t-2 border-l-2 rounded-tl-lg',
          'top-5 right-5 border-t-2 border-r-2 rounded-tr-lg',
          'bottom-5 left-5 border-b-2 border-l-2 rounded-bl-lg',
          'bottom-5 right-5 border-b-2 border-r-2 rounded-br-lg',
        ] as const
      ).map((cls) => (
        <div
          key={cls}
          className={`absolute w-7 h-7 border-studio-accent/40 ${cls}`}
        />
      ))}

      {/* Hint */}
      {!hasImage && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-studio-muted">
          <span>{t('canvasHint')}</span>
          <InfoIcon width={13} height={13} className="opacity-70" />
        </div>
      )}
    </div>
  )
}
