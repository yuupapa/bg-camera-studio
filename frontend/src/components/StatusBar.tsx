import { useEffect, useState } from 'react'
import { useT } from '../i18n'

export default function StatusBar() {
  const t = useT()
  const [reachable, setReachable] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const r = await fetch('/api/health')
        if (!r.ok) throw new Error('not ok')
        if (!cancelled) setReachable('online')
      } catch {
        if (!cancelled) setReachable('offline')
      }
    }
    check()
    const id = setInterval(check, 30000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  // Only surface the status when a backend is actually reachable. The public
  // (GitHub Pages) build has no backend, so showing a red "offline" badge
  // would just look broken to users — stay hidden unless the API is online.
  if (reachable !== 'online') return null

  return (
    <div className="px-4 py-2 flex items-center gap-2 text-[10px] text-studio-dim shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {t('apiOk')}
    </div>
  )
}
