import { useState } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import Logo from './Logo'
import HelpModal from './HelpModal'
import { useT } from '../i18n'
import { paintStore } from '../lib/paintStore'
import { usePaintStoreVersion } from '../lib/usePaintStoreVersion'
import { UndoIcon, RedoIcon, HelpIcon } from './icons'

export default function Header() {
  const t = useT()
  usePaintStoreVersion()
  const canUndo = paintStore.canUndo()
  const canRedo = paintStore.canRedo()
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <>
    <header className="relative z-30 flex items-center h-14 px-4 glass border-b border-white/[0.07] shrink-0">
      <div className="flex items-center gap-3">
        <Logo size={36} className="shadow-glow" />
        <div className="leading-tight">
          <h1 className="text-[15px] font-bold tracking-tight text-studio-text">{t('appTitle')}</h1>
        </div>
        <span className="text-xs text-studio-muted ml-1 hidden sm:inline">{t('appSubtitle')}</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => paintStore.undo()}
          disabled={!canUndo}
          title={t('undo')}
          className="icon-btn w-9 h-9 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          <UndoIcon />
        </button>
        <button
          onClick={() => paintStore.redo()}
          disabled={!canRedo}
          title={t('redo')}
          className="icon-btn w-9 h-9 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          <RedoIcon />
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button title={t('help')} onClick={() => setHelpOpen(true)} className="icon-btn w-9 h-9">
          <HelpIcon />
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <LanguageSwitcher />
      </div>
    </header>
    {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
  </>
  )
}
