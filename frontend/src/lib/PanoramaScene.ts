import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { disposeScene } from './three-setup'

/**
 * Compute the on-screen camera's vertical FOV so that the output-guide
 * rectangle (export aspect, contain-fit into the canvas) always subtends
 * exactly `exportFov` vertically — i.e. the framed region is independent
 * of the window / canvas size.
 *
 *  - canvasAspect >= exportAspect → guide frame fills the canvas height,
 *    so the canvas vertical FOV must equal exportFov.
 *  - canvasAspect <  exportAspect → guide frame fills the canvas width,
 *    so we match the horizontal FOV instead and back-solve the vertical.
 *
 * Continuous at canvasAspect === exportAspect (both branches give exportFov).
 */
export function deriveCanvasFov(
  exportFov: number,
  exportAspect: number,
  canvasAspect: number,
): number {
  if (canvasAspect >= exportAspect) return exportFov
  const tanHalfExport = Math.tan((exportFov * Math.PI) / 360) // tan(fov/2)
  const tanHalfHoriz = tanHalfExport * exportAspect
  const halfCanvasRad = Math.atan(tanHalfHoriz / canvasAspect)
  return (halfCanvasRad * 360) / Math.PI
}

export class PanoramaScene {
  readonly scene = new THREE.Scene()
  readonly camera: THREE.PerspectiveCamera
  private sphere: THREE.Mesh | null = null
  private controls: OrbitControls
  private roll = 0
  private rollQuat = new THREE.Quaternion()

  // Canonical capture parameters — window-size independent.
  private exportFov: number
  private exportAspect: number
  private canvasAspect: number

  constructor(
    renderer: THREE.WebGLRenderer,
    aspect: number,
    fov = 50,
    exportAspect = 16 / 9,
  ) {
    // Transparent so the decorative CSS backdrop shows in the empty state.
    this.scene.background = null

    this.exportFov = fov
    this.exportAspect = exportAspect
    this.canvasAspect = aspect

    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 2000)
    this.camera.position.set(0, 0, 0.01)
    this.camera.lookAt(0, 0, 0)
    this.applyDerivedFov()

    this.controls = new OrbitControls(this.camera, renderer.domElement)
    this.controls.enablePan = false
    this.controls.enableZoom = false
    this.controls.rotateSpeed = -0.3
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
  }

  loadTexture(texture: THREE.Texture) {
    this.clearTexture()
    texture.wrapS = THREE.RepeatWrapping
    texture.repeat.x = -1
    texture.offset.x = 1
    const geometry = new THREE.SphereGeometry(500, 64, 32)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    })
    this.sphere = new THREE.Mesh(geometry, material)
    this.scene.add(this.sphere)
  }

  clearTexture() {
    if (this.sphere) {
      this.scene.remove(this.sphere)
      this.sphere.geometry.dispose()
      const material = this.sphere.material as THREE.MeshBasicMaterial
      material.map?.dispose()
      material.dispose()
      this.sphere = null
    }
  }

  /** Recompute the on-screen camera FOV from the canonical capture params. */
  private applyDerivedFov() {
    this.camera.fov = deriveCanvasFov(this.exportFov, this.exportAspect, this.canvasAspect)
    this.camera.aspect = this.canvasAspect
    this.camera.updateProjectionMatrix()
  }

  /** Vertical FOV of the exported region (FOV slider / wheel zoom). */
  setExportFov(fov: number) {
    this.exportFov = fov
    this.applyDerivedFov()
  }

  /** Aspect ratio of the active output preset. */
  setExportAspect(aspect: number) {
    this.exportAspect = aspect
    this.applyDerivedFov()
  }

  setAspect(aspect: number) {
    this.canvasAspect = aspect
    this.applyDerivedFov()
  }

  setRoll(roll: number) {
    this.roll = roll
    this.rollQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll)
  }

  setActive(active: boolean) {
    this.controls.enabled = active
  }

  update() {
    this.controls.update()
    // Apply camera roll (tilt) after OrbitControls has set orientation
    if (this.roll !== 0) {
      this.camera.quaternion.multiply(this.rollQuat)
    }
  }

  dispose() {
    this.controls.dispose()
    this.clearTexture()
    disposeScene(this.scene)
  }
}
