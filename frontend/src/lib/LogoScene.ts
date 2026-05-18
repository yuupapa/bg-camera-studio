import * as THREE from 'three'

/**
 * Idle-state 3D logo scene.
 * Renders a glossy rotating cube with the app logo mapped on each face,
 * orbiting coloured point-lights for moving surface reflections,
 * and neon edge wireframe for a CG look.
 * Shown behind the transparent main canvas when no panorama is loaded.
 */
export class LogoScene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera

  private cube: THREE.Mesh
  private edgeLines: THREE.LineSegments
  private lights: THREE.PointLight[]
  private clock = new THREE.Clock()
  private disposed = false

  constructor(renderer: THREE.WebGLRenderer, aspect: number) {
    this.scene = new THREE.Scene()
    this.scene.background = null // transparent — CSS backdrop shows through

    this.camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 100)
    this.camera.position.set(0, 0.4, 5.5)
    this.camera.lookAt(0, 0, 0)

    // ── Lighting ──────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x606080, 0.6)
    this.scene.add(ambient)

    this.lights = [
      new THREE.PointLight(0x8b5cf6, 80, 18), // purple — key
      new THREE.PointLight(0x22d3ee, 50, 18), // cyan — fill
      new THREE.PointLight(0x6366f1, 40, 18), // indigo — rim
    ]
    this.lights.forEach((l) => this.scene.add(l))

    // ── Logo texture ─────────────────────────────────
    const loader = new THREE.TextureLoader()
    const texture = loader.load('/logo.png')
    texture.colorSpace = THREE.SRGBColorSpace

    // ── Cube ─────────────────────────────────────────
    const size = 2
    const geometry = new THREE.BoxGeometry(size, size, size, 1, 1, 1)

    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      metalness: 0.55,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      emissive: new THREE.Color(0x120830),
      emissiveIntensity: 0.5,
      reflectivity: 0.9,
    })

    // Build a simple env map from a small procedural gradient scene
    // so the clearcoat / metalness has something to reflect
    this.buildEnvMap(renderer, material)

    this.cube = new THREE.Mesh(geometry, material)
    this.scene.add(this.cube)

    // ── Neon edge wireframe ──────────────────────────
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.4,
    })
    this.edgeLines = new THREE.LineSegments(edges, lineMat)
    this.cube.add(this.edgeLines)
  }

  /** Generate a tiny procedural environment cube-map for reflections */
  private buildEnvMap(
    renderer: THREE.WebGLRenderer,
    material: THREE.MeshPhysicalMaterial,
  ) {
    const pmrem = new THREE.PMREMGenerator(renderer)
    pmrem.compileEquirectangularShader()

    const envScene = new THREE.Scene()
    // Dark gradient dome
    const c1 = new THREE.Color(0x0a0520)
    const c2 = new THREE.Color(0x1a1050)
    const c3 = new THREE.Color(0x22d3ee).multiplyScalar(0.08)

    envScene.background = c1

    // Coloured glow spheres scattered in the env
    const makeSphere = (color: THREE.Color, x: number, y: number, z: number, r: number) => {
      const g = new THREE.SphereGeometry(r, 8, 8)
      const m = new THREE.MeshBasicMaterial({ color })
      const s = new THREE.Mesh(g, m)
      s.position.set(x, y, z)
      envScene.add(s)
    }
    makeSphere(c2, 3, 4, -5, 2)
    makeSphere(c3, -4, -2, -3, 1.5)
    makeSphere(new THREE.Color(0x8b5cf6).multiplyScalar(0.15), 5, -1, 2, 2.5)

    const envMap = pmrem.fromScene(envScene, 0, 0.1, 100).texture
    material.envMap = envMap
    material.envMapIntensity = 1.2

    pmrem.dispose()
    envScene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        ;(obj.material as THREE.Material).dispose()
      }
    })
  }

  setAspect(aspect: number) {
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
  }

  update() {
    if (this.disposed) return
    const t = this.clock.getElapsedTime()

    // Slow continuous rotation with gentle wobble
    this.cube.rotation.y = t * 0.25
    this.cube.rotation.x = Math.sin(t * 0.15) * 0.18

    // Edge glow pulse
    const lineMat = this.edgeLines.material as THREE.LineBasicMaterial
    lineMat.opacity = 0.25 + Math.sin(t * 1.2) * 0.15

    // Orbit lights around the cube for moving highlights
    this.lights[0].position.set(
      Math.cos(t * 0.4) * 4.5,
      Math.sin(t * 0.55) * 3,
      Math.cos(t * 0.35 + 1) * 3 + 2,
    )
    this.lights[1].position.set(
      Math.cos(t * 0.3 + 2.1) * 3.5,
      2.5,
      Math.sin(t * 0.4 + 0.5) * 4,
    )
    this.lights[2].position.set(
      -3,
      Math.cos(t * 0.5 + 1) * 3,
      Math.sin(t * 0.45 + 2) * 3.5,
    )
  }

  dispose() {
    this.disposed = true
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => m.dispose())
      }
      if (obj instanceof THREE.LineSegments) {
        obj.geometry.dispose()
        ;(obj.material as THREE.Material).dispose()
      }
    })
  }
}
