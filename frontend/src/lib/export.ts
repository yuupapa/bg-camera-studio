import * as THREE from 'three'
import { paintStore } from './paintStore'

export function exportPng(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
) {
  const previewAspect = camera.aspect
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

  const exportCamera = camera.clone()
  if (exportAspect <= previewAspect) {
    exportCamera.aspect = exportAspect
  } else {
    const previewFovRad = (camera.fov * Math.PI) / 180
    const newFovRad = 2 * Math.atan(Math.tan(previewFovRad / 2) * (previewAspect / exportAspect))
    exportCamera.fov = (newFovRad * 180) / Math.PI
    exportCamera.aspect = exportAspect
  }
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
  offRenderer.dispose()

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
}
