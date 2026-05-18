import { useEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { createRenderer } from '../lib/three-setup'

interface ThreeCanvasProps {
  onReady?: (ctx: { renderer: THREE.WebGLRenderer; width: number; height: number }) => void
  onTick?: (renderer: THREE.WebGLRenderer) => void
  onResize?: (width: number, height: number) => void
  onDispose?: () => void
  children?: ReactNode
}

export default function ThreeCanvas({
  onReady,
  onTick,
  onResize,
  onDispose,
  children,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onTickRef = useRef(onTick)
  const onResizeRef = useRef(onResize)
  const onDisposeRef = useRef(onDispose)
  onTickRef.current = onTick
  onResizeRef.current = onResize
  onDisposeRef.current = onDispose

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const renderer = createRenderer(canvas)
    const { width, height } = container.getBoundingClientRect()
    renderer.setSize(width, height, false)

    onReady?.({ renderer, width, height })

    let animId = 0
    const tick = () => {
      animId = requestAnimationFrame(tick)
      onTickRef.current?.(renderer)
    }
    tick()

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width: w, height: h } = entry.contentRect
      if (w > 0 && h > 0) {
        renderer.setSize(w, h, false)
        onResizeRef.current?.(w, h)
      }
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      observer.disconnect()
      onDisposeRef.current?.()
      renderer.dispose()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {children}
    </div>
  )
}
