import * as THREE from 'three'

export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  return renderer
}

export function createCamera(fov = 50, aspect = 16 / 9): THREE.PerspectiveCamera {
  return new THREE.PerspectiveCamera(fov, aspect, 0.1, 2000)
}

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
) {
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

export function disposeScene(scene: THREE.Scene) {
  // Material.dispose() does not free attached textures — release the common
  // texture slots so this generic helper doesn't leak when reused.
  const disposeMaterial = (m: THREE.Material) => {
    const std = m as THREE.MeshStandardMaterial
    std.map?.dispose()
    std.normalMap?.dispose()
    std.envMap?.dispose()
    m.dispose()
  }
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose()
      if (Array.isArray(obj.material)) {
        obj.material.forEach(disposeMaterial)
      } else {
        disposeMaterial(obj.material)
      }
    }
  })
}
