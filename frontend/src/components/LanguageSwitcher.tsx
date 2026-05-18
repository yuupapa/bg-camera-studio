import { useStudioStore } from '../store'
import { LANGUAGE_OPTIONS } from '../i18n'
import type { Language } from '../types'
import { ChevronDownIcon } from './icons'

export default function LanguageSwitcher() {
  const language = useStudioStore((s) => s.language)
  const setLanguage = useStudioStore((s) => s.setLanguage)

  const current = LANGUAGE_OPTIONS.find((o) => o.value === language)

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="appearance-none glass-soft text-studio-text text-xs pl-3 pr-7 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-studio-accent/60 hover:border-studio-accent/40 transition-colors"
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        width={13}
        height={13}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-studio-muted pointer-events-none"
      />
      <span className="sr-only">{current?.label}</span>
    </div>
  )
}
