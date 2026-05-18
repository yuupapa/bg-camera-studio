import * as THREE from 'three'

const MAX_TEXTURE_SIZE = 8192

export function loadTextureFromFile(
  file: File,
  renderer?: THREE.WebGLRenderer,
): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const maxSize = renderer
        ? renderer.capabilities.maxTextureSize
        : MAX_TEXTURE_SIZE
      const canvas = fitToMaxSize(img, maxSize)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      if (renderer) {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      }
      texture.needsUpdate = true
      URL.revokeObjectURL(url)
      resolve(texture)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('画像の読み込みに失敗しました'))
    }
    img.src = url
  })
}

function fitToMaxSize(img: HTMLImageElement, maxSize: number): HTMLCanvasElement {
  let w = img.width
  let h = img.height

  if (w > maxSize || h > maxSize) {
    const scale = maxSize / Math.max(w, h)
    w = Math.round(w * scale)
    h = Math.round(h * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
  return canvas
}
