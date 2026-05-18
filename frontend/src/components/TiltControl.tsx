import { useStudioStore } from '../store'
import { useT } from '../i18n'
import { TiltIcon } from './icons'

const RAD2DEG = 180 / Math.PI
const DEG2RAD = Math.PI / 180

// Contextual panel shown only while the Tilt tool is active.
// Displays the current roll angle, allows precise slider adjustment,
// and resets back to 0° in one click.
export default function TiltControl() {
  const t = useT()
  const cameraTool = useStudioStore((s) => s.cameraTool)
  const paintMode = useStudioStore((s) => s.paintMode)
  const cameraRoll = useStudioStore((s) => s.cameraRoll)
  const setCameraRoll = useStudioStore((s) => s.setCameraRoll)

  if (paintMode || cameraTool !== 'tilt') return null

  const deg = Math.round(cameraRoll * RAD2DEG)

  return (
    <div className="absolute top-[84px] left-1/2 -translate-x-1/2 z-20 glass rounded-2xl px-4 py-2.5 shadow-card flex items-center gap-4 pointer-events-auto">
      <div className="flex items-center gap-2 shrink-0">
        <TiltIcon width={15} height={15} className="text-studio-accent2" />
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-studio-muted">{t('tiltAngle')}</span>
          <span className="text-sm font-mono text-studio-text tabular-nums">
            {deg > 0 ? '+' : ''}
            {deg}°
          </span>
        </div>
      </div>
      <input
        type="range"
        min={-90}
        max={90}
        step={1}
        value={deg}
        onChange={(e) => setCameraRoll(Number(e.target.value) * DEG2RAD)}
        className="w-44"
      />
      <button
        onClick={() => setCameraRoll(0)}
        disabled={deg === 0}
        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-studio-muted hover:text-studio-text hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed shrink-0"
      >
        {t('tiltReset')}
      </button>
    </div>
  )
}
