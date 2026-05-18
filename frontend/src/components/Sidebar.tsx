import { useState } from 'react'
import { useStudioStore } from '../store'
import { EXPORT_PRESETS } from '../types'
import { useT, PRESET_KEYS } from '../i18n'
import { ImageIcon, CloseIcon, ChevronDownIcon } from './icons'

export default function Sidebar() {
  const t = useT()
  const panoramaFileName = useStudioStore((s) => s.panoramaFileName)
  const exportWidth = useStudioStore((s) => s.exportWidth)
  const exportHeight = useStudioStore((s) => s.exportHeight)
  const setExportResolution = useStudioStore((s) => s.setExportResolution)
  const clearPanoramaImage = useStudioStore((s) => s.clearPanoramaImage)

  const brightness = useStudioStore((s) => s.brightness)
  const setBrightness = useStudioStore((s) => s.setBrightness)
  const saturation = useStudioStore((s) => s.saturation)
  const setSaturation = useStudioStore((s) => s.setSaturation)
  const hueShift = useStudioStore((s) => s.hueShift)
  const setHueShift = useStudioStore((s) => s.setHueShift)

  const currentPresetIdx = EXPORT_PRESETS.findIndex(
    (p) => p.width === exportWidth && p.height === exportHeight,
  )
  const isCustom = currentPresetIdx < 0

  const [customMode, setCustomMode] = useState(false)
  const [customW, setCustomW] = useState(String(exportWidth))
  const [customH, setCustomH] = useState(String(exportHeight))

  const applyCustom = () => {
    const w = Math.max(100, Math.min(7680, Number(customW) || 1920))
    const h = Math.max(100, Math.min(4320, Number(customH) || 1080))
    setCustomW(String(w))
    setCustomH(String(h))
    setExportResolution(w, h)
  }

  const selectPreset = (idx: number) => {
    const p = EXPORT_PRESETS[idx]
    if (p) {
      setExportResolution(p.width, p.height)
      setCustomMode(false)
    }
  }

  const enterCustomMode = () => {
    setCustomMode(true)
    setCustomW(String(exportWidth))
    setCustomH(String(exportHeight))
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Image */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-studio-muted uppercase tracking-wider">
            {t('image')}
          </span>
          {panoramaFileName && (
            <button
              onClick={clearPanoramaImage}
              className="icon-btn w-5 h-5"
              title="✕"
            >
              <CloseIcon width={13} height={13} />
            </button>
          )}
        </div>
        <div className="glass-soft rounded-xl px-3 py-2.5 flex items-center gap-2">
          <ImageIcon width={16} height={16} className="text-studio-muted shrink-0" />
          <span className="text-xs text-studio-muted truncate">
            {panoramaFileName ?? t('dropHere')}
          </span>
        </div>
      </section>

      {/* Export presets */}
      <section>
        <div className="text-[11px] font-semibold text-studio-muted uppercase tracking-wider mb-2">
          {t('outputPresets')}
        </div>
        <div className="flex flex-col gap-1">
          {EXPORT_PRESETS.map((preset, idx) => {
            const active = idx === currentPresetIdx && !customMode
            return (
              <button
                key={preset.label}
                onClick={() => selectPreset(idx)}
                className={`text-left text-xs px-3 py-2 rounded-lg transition-all ${
                  active
                    ? 'grad-btn text-white font-medium'
                    : 'text-studio-muted hover:text-studio-text hover:bg-white/[0.04]'
                }`}
              >
                {t(PRESET_KEYS[idx] ?? 'presetYouTube')}
              </button>
            )
          })}
          <button
            onClick={enterCustomMode}
            className={`text-left text-xs px-3 py-2 rounded-lg transition-all ${
              customMode || isCustom
                ? 'grad-btn text-white font-medium'
                : 'text-studio-muted hover:text-studio-text hover:bg-white/[0.04]'
            }`}
          >
            {t('customSize')}
          </button>
        </div>
      </section>

      {/* Output size */}
      <section>
        <div className="text-[11px] font-semibold text-studio-muted uppercase tracking-wider mb-2">
          {t('outputSize')}
        </div>
        {customMode || isCustom ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customW}
              onChange={(e) => setCustomW(e.target.value)}
              onBlur={applyCustom}
              onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
              min={100}
              max={7680}
              className="w-full glass-soft text-sm text-studio-text px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-studio-accent/60"
            />
            <span className="text-studio-muted text-sm">×</span>
            <input
              type="number"
              value={customH}
              onChange={(e) => setCustomH(e.target.value)}
              onBlur={applyCustom}
              onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
              min={100}
              max={4320}
              className="w-full glass-soft text-sm text-studio-text px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-studio-accent/60"
            />
          </div>
        ) : (
          <div className="relative">
            <select
              value={currentPresetIdx >= 0 ? currentPresetIdx : 0}
              onChange={(e) => selectPreset(Number(e.target.value))}
              className="appearance-none w-full glass-soft text-sm text-studio-text pl-3 pr-9 py-2.5 rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-studio-accent/60"
            >
              {EXPORT_PRESETS.map((p, idx) => (
                <option key={p.label} value={idx}>
                  {p.width} × {p.height}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              width={15}
              height={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-studio-muted pointer-events-none"
            />
          </div>
        )}
      </section>

      {/* Color & Brightness adjustments */}
      <section>
        <div className="text-[11px] font-semibold text-studio-muted uppercase tracking-wider mb-3">
          {t('adjustments')}
        </div>
        <div className="flex flex-col gap-3">
          {/* Brightness */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-studio-muted">{t('brightness')}</span>
              <span className="text-[11px] text-studio-dim font-mono">{Math.round(brightness * 100)}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              value={Math.round(brightness * 100)}
              onChange={(e) => setBrightness(Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>
          {/* Saturation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-studio-muted">{t('saturationLabel')}</span>
              <span className="text-[11px] text-studio-dim font-mono">{Math.round(saturation * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={Math.round(saturation * 100)}
              onChange={(e) => setSaturation(Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>
          {/* Hue shift / color temperature */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-studio-muted">{t('hueShiftLabel')}</span>
              <span className="text-[11px] text-studio-dim font-mono">{hueShift > 0 ? '+' : ''}{hueShift}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={hueShift}
              onChange={(e) => setHueShift(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
