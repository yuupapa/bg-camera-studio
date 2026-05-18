import { useStudioStore } from '../store'
import { useT } from '../i18n'

export default function BottomControls() {
  const t = useT()
  const showOutputGuide = useStudioStore((s) => s.showOutputGuide)
  const toggleOutputGuide = useStudioStore((s) => s.toggleOutputGuide)

  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 glass rounded-2xl px-3 py-1.5 shadow-card">
      <span className="text-[10px] text-studio-muted select-none">
        {t('outputGuide')}
      </span>
      <button
        onClick={toggleOutputGuide}
        title={t('outputGuideDesc')}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{
          background: showOutputGuide
            ? 'linear-gradient(135deg,#7c3aed,#6366f1)'
            : 'rgba(255,255,255,0.12)',
        }}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            showOutputGuide ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}
