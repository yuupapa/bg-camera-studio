import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ThreeCanvas from './components/ThreeCanvas'
import ImageDropZone from './components/ImageDropZone'
import FovSlider from './components/FovSlider'
import ExportButton from './components/ExportButton'
import PaintControls from './components/PaintControls'
import PaintOverlay from './components/PaintOverlay'
import OutputFrameOverlay from './components/OutputFrameOverlay'
import CanvasToolbar from './components/CanvasToolbar'
import TiltControl from './components/TiltControl'
import CanvasDecor from './components/CanvasDecor'
import BottomControls from './components/BottomControls'
import StatusBar from './components/StatusBar'
import { PanoramaScene } from './lib/PanoramaScene'
import { LogoScene } from './lib/LogoScene'
import { paintStore } from './lib/paintStore'
import { useStudioStore } from './store'

function useUndoShortcut() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        if (e.shiftKey) paintStore.redo()
        else paintStore.undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault()
        paintStore.redo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}

function useDeleteShortcut() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const idx = paintStore.selectedIndex
        if (idx !== null) {
          e.preventDefault()
          paintStore.removeText(idx)
          paintStore.setSelectedIndex(null)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}

export default function App() {
  const panoramaImageUrl = useStudioStore((s) => s.panoramaImageUrl)
  const paintMode = useStudioStore((s) => s.paintMode)
  const brightness = useStudioStore((s) => s.brightness)
  const saturation = useStudioStore((s) => s.saturation)
  const hueShift = useStudioStore((s) => s.hueShift)

  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null)
  const [panoramaScene, setPanoramaScene] = useState<PanoramaScene | null>(null)
  const [exportScene, setExportScene] = useState<THREE.Scene | null>(null)
  const [exportCamera, setExportCamera] = useState<THREE.PerspectiveCamera | null>(null)

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const panoramaRef = useRef<PanoramaScene | null>(null)
  const logoRef = useRef<LogoScene | null>(null)
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const aspectRef = useRef(16 / 9)
  const stageWrapRef = useRef<HTMLDivElement>(null)

  const ensureScene = useCallback(() => {
    const rndr = rendererRef.current
    if (!rndr) return
    if (!panoramaRef.current) {
      const initFov = useStudioStore.getState().panoramaFov
      const pano = new PanoramaScene(rndr, aspectRef.current, initFov)
      panoramaRef.current = pano
      setPanoramaScene(pano)
      setExportScene(pano.scene)
      setExportCamera(pano.camera)
    }
    if (!logoRef.current) {
      logoRef.current = new LogoScene(rndr, aspectRef.current)
    }
  }, [])

  const handleReady = useCallback(
    (ctx: { renderer: THREE.WebGLRenderer; width: number; height: number }) => {
      rendererRef.current = ctx.renderer
      aspectRef.current = ctx.width / ctx.height
      setRenderer(ctx.renderer)
      ensureScene()
    },
    [ensureScene],
  )

  const handleTick = useCallback((rndr: THREE.WebGLRenderer) => {
    const pano = panoramaRef.current
    const logo = logoRef.current
    const hasImage = useStudioStore.getState().panoramaImageUrl !== null

    // Render 3D logo background when idle, panorama when image loaded
    if (!hasImage && logo) {
      logo.update()
      rndr.render(logo.scene, logo.camera)
    } else if (pano) {
      pano.update()
      rndr.render(pano.scene, pano.camera)
    }

    const pc = paintCanvasRef.current
    if (pc && pano) paintStore.render(pc, pano.camera)
  }, [])

  const handleResize = useCallback((w: number, h: number) => {
    const aspect = w / h
    aspectRef.current = aspect
    panoramaRef.current?.setAspect(aspect)
    logoRef.current?.setAspect(aspect)
  }, [])

  const handleDispose = useCallback(() => {
    panoramaRef.current?.dispose()
    panoramaRef.current = null
    logoRef.current?.dispose()
    logoRef.current = null
    rendererRef.current = null
    setPanoramaScene(null)
    setExportScene(null)
    setExportCamera(null)
    setRenderer(null)
  }, [])

  const handleFovChange = useCallback((fov: number) => {
    panoramaRef.current?.setFov(fov)
  }, [])

  const handlePaintCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    paintCanvasRef.current = canvas
  }, [])

  const cameraGetter = useCallback(() => panoramaRef.current?.camera ?? null, [])

  useEffect(() => {
    if (panoramaImageUrl === null) {
      panoramaRef.current?.clearTexture()
    }
  }, [panoramaImageUrl])

  useEffect(() => {
    const tool = useStudioStore.getState().cameraTool
    panoramaRef.current?.setActive(!paintMode && tool !== 'tilt')
  }, [paintMode])

  // Tilt drag: when cameraTool === 'tilt', drag left/right to roll the camera
  useEffect(() => {
    const el = stageWrapRef.current
    if (!el) return
    let dragging = false
    let startX = 0
    let startRoll = 0

    const onDown = (e: PointerEvent) => {
      const state = useStudioStore.getState()
      if (state.paintMode || state.cameraTool !== 'tilt') return
      // Only begin a tilt drag when the pointer lands on the 3D canvas
      // itself — never on the toolbar / controls layered above the stage,
      // otherwise pointer capture would swallow their click events.
      if (!(e.target instanceof HTMLCanvasElement)) return
      dragging = true
      startX = e.clientX
      startRoll = state.cameraRoll
      panoramaRef.current?.setActive(false)
      el.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - startX
      const roll = startRoll + dx * 0.005
      const clamped = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, roll))
      // cameraRoll is the single source of truth — the subscription below
      // applies it to the scene (so slider & reset work the same way).
      useStudioStore.getState().setCameraRoll(clamped)
    }
    const onUp = () => {
      dragging = false
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [])

  // Sync cameraTool / cameraRoll changes with the panorama scene
  useEffect(() => {
    const unsub = useStudioStore.subscribe((state, prev) => {
      if (state.cameraTool !== prev.cameraTool || state.paintMode !== prev.paintMode) {
        panoramaRef.current?.setActive(!state.paintMode && state.cameraTool !== 'tilt')
      }
      if (state.cameraRoll !== prev.cameraRoll) {
        panoramaRef.current?.setRoll(state.cameraRoll)
      }
    })
    return unsub
  }, [])

  // Scroll to zoom (FOV) when not painting — "ドラッグで回転、スクロールでズーム"
  useEffect(() => {
    const el = stageWrapRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (useStudioStore.getState().paintMode) return
      e.preventDefault()
      const cur = useStudioStore.getState().panoramaFov
      const next = Math.max(30, Math.min(120, cur + (e.deltaY > 0 ? 3 : -3)))
      if (next !== cur) {
        useStudioStore.getState().setPanoramaFov(next)
        panoramaRef.current?.setFov(next)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  useUndoShortcut()
  useDeleteShortcut()

  return (
    <div className="h-full flex flex-col text-studio-text">
      <Header />
      <div className="flex flex-1 min-h-0">
        <aside className="w-[280px] glass border-r border-white/[0.06] flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto">
            <Sidebar />
            <div className="border-t border-white/[0.05] mt-1 pt-3">
              <FovSlider onFovChange={handleFovChange} />
            </div>
            <div className="border-t border-white/[0.05] mt-1 pt-3">
              <PaintControls
                cameraGetter={cameraGetter}
                canvasGetter={() => paintCanvasRef.current}
              />
            </div>
          </div>
          <div className="border-t border-white/[0.06]">
            <ExportButton scene={exportScene} camera={exportCamera} />
            <StatusBar />
          </div>
        </aside>

        <div ref={stageWrapRef} className="flex-1 relative min-w-0 min-h-0 overflow-hidden">
          <CanvasDecor />
          <div
            className="absolute inset-0"
            style={{
              filter:
                brightness !== 1 || saturation !== 1 || hueShift !== 0
                  ? `brightness(${brightness}) saturate(${saturation}) hue-rotate(${hueShift}deg)`
                  : undefined,
            }}
          >
          <ThreeCanvas
            onReady={handleReady}
            onTick={handleTick}
            onResize={handleResize}
            onDispose={handleDispose}
          >
            <PaintOverlay cameraGetter={cameraGetter} onCanvasReady={handlePaintCanvasReady} />
            <OutputFrameOverlay />
            <ImageDropZone panoramaScene={panoramaScene} renderer={renderer} />
          </ThreeCanvas>
          </div>
          <CanvasToolbar />
          <TiltControl />
          <BottomControls />
        </div>
      </div>
    </div>
  )
}
