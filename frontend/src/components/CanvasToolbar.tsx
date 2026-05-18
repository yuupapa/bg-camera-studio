import { useStudioStore } from '../store'
import { useT } from '../i18n'
import { paintStore } from '../lib/paintStore'
import { usePaintStoreVersion } from '../lib/usePaintStoreVersion'
import {
  BrushIcon,
  HandIcon,
  TiltIcon,
  UndoIcon,
  RedoIcon,
} from './icons'
import type { CameraTool } from '../store'

type ToolKey = 'paint' | CameraTool

export default function CanvasToolbar() {
  const t = useT()
  usePaintStoreVersion()
  const paintMode = useStudioStore((s) => s.paintMode)
  const setPaintMode = useStudioStore((s) => s.setPaintMode)
  const cameraTool = useStudioStore((s) => s.cameraTool)
  const setCameraTool = useStudioStore((s) => s.setCameraTool)

  const active: ToolKey = paintMode ? 'paint' : cameraTool

  const selectTool = (key: ToolKey) => {
    if (key === 'paint') {
      setPaintMode(true)
    } else {
      setPaintMode(false)
      setCameraTool(key)
    }
  }

  const tools: { key: ToolKey; label: string; Icon: typeof BrushIcon }[] = [
    { key: 'paint', label: t('toolPaint'), Icon: BrushIcon },
    { key: 'pan', label: t('toolPan'), Icon: HandIcon },
    { key: 'tilt', label: t('toolTilt'), Icon: TiltIcon },
  ]

  const canUndo = paintStore.canUndo()
  const canRedo = paintStore.canRedo()

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-none">
      <div className="glass rounded-2xl p-1.5 flex items-center gap-1 shadow-card pointer-events-auto">
        {tools.map(({ key, label, Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => selectTool(key)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all ${
                isActive
                  ? 'grad-btn text-white'
                  : 'text-studio-muted hover:text-studio-text hover:bg-white/5'
              }`}
            >
              <Icon width={18} height={18} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>

      <div className="glass rounded-2xl p-1.5 flex items-center gap-1 shadow-card pointer-events-auto">
        <button
          onClick={() => paintStore.undo()}
          disabled={!canUndo}
          className="flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl text-studio-muted hover:text-studio-text hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          <UndoIcon width={18} height={18} />
          <span className="text-[10px] font-medium">{t('undo')}</span>
        </button>
        <button
          onClick={() => paintStore.redo()}
          disabled={!canRedo}
          className="flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl text-studio-muted hover:text-studio-text hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          <RedoIcon width={18} height={18} />
          <span className="text-[10px] font-medium">{t('redo')}</span>
        </button>
      </div>
    </div>
  )
}
