import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { disposeScene } from './three-setup'

export class PanoramaScene {
  readonly scene = new THREE.Scene()
  readonly camera: THREE.PerspectiveCamera
  private sphere: THREE.Mesh | null = null
  private controls: OrbitControls
  private roll = 0
  private rollQuat = new THREE.Quaternion()

  constructor(renderer: THREE.WebGLRenderer, aspect: number, fov = 50) {
    // Transparent so the decorative CSS backdrop shows in the empty state.
    this.scene.background = null

    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 2000)
    this.camera.position.set(0, 0, 0.01)
    this.camera.lookAt(0, 0, 0)

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

  setFov(fov: number) {
    this.camera.fov = fov
    this.camera.updateProjectionMatrix()
  }

  setAspect(aspect: number) {
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
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
