import * as THREE from 'three'
import { paintStore } from './paintStore'

export function exportPng(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
  exportFov: number,
) {
  const exportAspect = width / height

  const offRenderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: false,
  })
  offRenderer.setPixelRatio(1)
  offRenderer.setSize(width, height)
  offRenderer.outputColorSpace = THREE.SRGBColorSpace
  offRenderer.toneMapping = THREE.NoToneMapping

  // The offscreen renderer holds a WebGL context — dispose it in `finally`
  // so it is freed even if rendering or canvas encoding throws.
  try {
    // The exported region is defined purely by the FOV setting and the output
    // aspect ratio — never by the on-screen window/canvas size. The cloned
    // camera keeps the current orientation (including tilt/roll).
    const exportCamera = camera.clone()
    exportCamera.fov = exportFov
    exportCamera.aspect = exportAspect
    exportCamera.updateProjectionMatrix()

    offRenderer.render(scene, exportCamera)

    const composite = document.createElement('canvas')
    composite.width = width
    composite.height = height
    const ctx = composite.getContext('2d')!
    ctx.drawImage(offRenderer.domElement, 0, 0, width, height)

    // Render paint annotations at full export resolution using the export camera
    // so world-locked strokes/text appear exactly where they belong in the export.
    if (!paintStore.isEmpty()) {
      const paintExport = document.createElement('canvas')
      paintExport.width = width
      paintExport.height = height
      paintStore.render(paintExport, exportCamera)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(paintExport, 0, 0)
    }

    const dataUrl = composite.toDataURL('image/png')

    const now = new Date()
    const ts = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      '-',
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('')

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `bg-export-${ts}.png`
    a.click()
  } finally {
    offRenderer.dispose()
  }
}
