import { useStudioStore } from '../store'
import { useT } from '../i18n'

interface Props {
  onFovChange?: (fov: number) => void
}

export default function FovSlider({ onFovChange }: Props) {
  const t = useT()
  const fov = useStudioStore((s) => s.panoramaFov)
  const setFov = useStudioStore((s) => s.setPanoramaFov)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setFov(v)
    onFovChange?.(v)
  }

  return (
    <div className="px-4 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-studio-muted uppercase tracking-wider">
          {t('fov')}
        </span>
        <span className="text-xs text-studio-accent2 font-medium tabular-nums">{fov}°</span>
      </div>
      <input
        type="range"
        min={30}
        max={120}
        value={fov}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  )
}
