import type * as THREE from 'three'
import { useStudioStore } from '../store'
import { useT } from '../i18n'
import type { PaintTool } from '../store'
import { paintStore } from '../lib/paintStore'
import { usePaintStoreVersion } from '../lib/usePaintStoreVersion'
import { UndoIcon, BrushIcon, EraserIcon, TextIcon, TrashIcon } from './icons'

const PRESET_COLORS = ['#ff3030', '#30ff30', '#3080ff', '#ffd030', '#ff30c8', '#ffffff', '#000000']

interface Props {
  cameraGetter?: () => THREE.PerspectiveCamera | null
  canvasGetter?: () => HTMLCanvasElement | null
}

export default function PaintControls({ cameraGetter, canvasGetter }: Props = {}) {
  const t = useT()
  const paintMode = useStudioStore((s) => s.paintMode)
  const setPaintMode = useStudioStore((s) => s.setPaintMode)
  const paintTool = useStudioStore((s) => s.paintTool)
  const setPaintTool = useStudioStore((s) => s.setPaintTool)
  const paintColor = useStudioStore((s) => s.paintColor)
  const setPaintColor = useStudioStore((s) => s.setPaintColor)
  const paintSize = useStudioStore((s) => s.paintSize)
  const setPaintSize = useStudioStore((s) => s.setPaintSize)
  const paintFontSize = useStudioStore((s) => s.paintFontSize)
  const setPaintFontSize = useStudioStore((s) => s.setPaintFontSize)
  const clearPaint = useStudioStore((s) => s.clearPaint)
  useStudioStore((s) => s.panoramaFov)

  usePaintStoreVersion()
  const canUndo = paintStore.canUndo()
  const selectedIdx = paintStore.selectedIndex
  const selectedText = selectedIdx !== null ? paintStore.texts[selectedIdx] ?? null : null

  const camera = cameraGetter?.() ?? null
  const canvas = canvasGetter?.() ?? null
  const pxPerRad = camera && canvas
    ? canvas.height / (2 * Math.tan(((camera.fov * Math.PI) / 180) / 2))
    : 500

  const tools: { key: PaintTool; label: string; Icon: typeof BrushIcon }[] = [
    { key: 'brush', label: t('brush'), Icon: BrushIcon },
    { key: 'eraser', label: t('eraser'), Icon: EraserIcon },
    { key: 'text', label: t('text'), Icon: TextIcon },
  ]

  const sliderValue = paintTool === 'text' && selectedText
    ? Math.max(10, Math.min(300, Math.round(selectedText.worldSize * pxPerRad)))
    : paintFontSize

  const handleFontSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    if (paintTool === 'text' && selectedIdx !== null) {
      paintStore.setTextWorldSize(selectedIdx, v / pxPerRad)
    } else {
      setPaintFontSize(v)
    }
  }

  return (
    <div className="px-4 pb-2">
      <div className="text-[11px] font-semibold text-studio-muted uppercase tracking-wider mb-2">
        {t('paint')}
      </div>

      <button
        onClick={() => paintStore.undo()}
        disabled={!canUndo}
        title="Ctrl+Z"
        className="w-full mb-2 py-2 px-3 rounded-xl glass-soft text-xs text-studio-text flex items-center justify-center gap-1.5 hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <UndoIcon width={14} height={14} />
        {t('undo')}
      </button>

      <button
        onClick={() => setPaintMode(!paintMode)}
        className={`w-full py-2.5 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
          paintMode
            ? 'grad-btn text-white'
            : 'glass-soft text-studio-text hover:bg-white/[0.04]'
        }`}
      >
        <BrushIcon width={15} height={15} />
        {paintMode ? t('paintModeOn') : t('paintModeOff')}
      </button>
      <p className="mt-2 text-[10px] text-studio-muted/70 leading-snug">
        {paintMode && paintTool === 'text' ? t('textHint') : t('paintHint')}
      </p>

      {paintMode && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {tools.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setPaintTool(key)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] transition-all ${
                  paintTool === key
                    ? 'grad-btn text-white'
                    : 'glass-soft text-studio-muted hover:text-studio-text'
                }`}
              >
                <Icon width={15} height={15} />
                {label}
              </button>
            ))}
          </div>

          <div>
            <div className="text-[10px] text-studio-muted mb-1.5">{t('color')}</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setPaintColor(c)}
                  aria-label={c}
                  className={`w-6 h-6 rounded-lg border transition-transform hover:scale-110 ${
                    paintColor === c
                      ? 'border-white ring-2 ring-studio-accent/60'
                      : 'border-white/15'
                  }`}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                value={paintColor}
                onChange={(e) => setPaintColor(e.target.value)}
                className="w-6 h-6 rounded-lg border border-white/15 bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {paintTool === 'text' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-studio-muted">
                  {selectedText ? `${t('fontSize')} (選択中)` : t('fontSize')}
                </span>
                <span className="text-[10px] text-studio-accent2 tabular-nums">{sliderValue}</span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                value={sliderValue}
                onChange={handleFontSliderChange}
                className="w-full"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-studio-muted">{t('size')}</span>
                <span className="text-[10px] text-studio-accent2 tabular-nums">{paintSize}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={paintSize}
                onChange={(e) => setPaintSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <button
            onClick={clearPaint}
            className="w-full py-2 px-3 rounded-lg text-[11px] text-studio-muted flex items-center justify-center gap-1.5 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <TrashIcon width={13} height={13} />
            {t('clearPaint')}
          </button>
        </div>
      )}
    </div>
  )
}
