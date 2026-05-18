import { useEffect, useRef, useState } from 'react'
import { useStudioStore } from '../store'

export default function OutputFrameOverlay() {
  const exportWidth = useStudioStore((s) => s.exportWidth)
  const exportHeight = useStudioStore((s) => s.exportHeight)
  const panoramaImageUrl = useStudioStore((s) => s.panoramaImageUrl)
  const showOutputGuide = useStudioStore((s) => s.showOutputGuide)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setSize({ w: r.width, h: r.height })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!panoramaImageUrl || !showOutputGuide || size.w <= 0 || size.h <= 0) {
    return <div ref={wrapperRef} className="absolute inset-0 pointer-events-none" />
  }

  const exportAspect = exportWidth / exportHeight
  const containerAspect = size.w / size.h

  let frameW: number
  let frameH: number
  if (containerAspect > exportAspect) {
    frameH = size.h
    frameW = frameH * exportAspect
  } else {
    frameW = size.w
    frameH = frameW / exportAspect
  }
  const left = (size.w - frameW) / 2
  const top = (size.h - frameH) / 2

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="pointer-events-none"
        style={{
          position: 'absolute',
          left,
          top,
          width: frameW,
          height: frameH,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.55)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: left + 6,
          top: top + 6,
        }}
        className="text-[10px] text-white/70 font-mono select-none pointer-events-none"
      >
        {exportWidth} × {exportHeight}
      </div>
    </div>
  )
}
