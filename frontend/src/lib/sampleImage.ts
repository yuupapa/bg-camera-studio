// Generates a procedural equirectangular (2:1) panorama as a File,
// so users can try the app instantly without their own image.
export async function createSamplePanorama(): Promise<File> {
  const W = 2048
  const H = 1024
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Sky gradient (top) → horizon
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55)
  sky.addColorStop(0, '#1a1147')
  sky.addColorStop(0.45, '#3b2a7a')
  sky.addColorStop(0.8, '#7e5fb0')
  sky.addColorStop(1, '#e9a06b')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H * 0.55)

  // Ground gradient (bottom)
  const ground = ctx.createLinearGradient(0, H * 0.55, 0, H)
  ground.addColorStop(0, '#2a1c4a')
  ground.addColorStop(1, '#0b0820')
  ctx.fillStyle = ground
  ctx.fillRect(0, H * 0.55, W, H * 0.45)

  // Stars (upper sky)
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * W
    const y = Math.random() * H * 0.42
    const r = Math.random() * 1.4
    ctx.globalAlpha = 0.3 + Math.random() * 0.7
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Aurora bands
  for (let b = 0; b < 3; b++) {
    ctx.beginPath()
    const yBase = H * (0.18 + b * 0.08)
    ctx.moveTo(0, yBase)
    for (let x = 0; x <= W; x += 32) {
      const y = yBase + Math.sin((x / W) * Math.PI * 6 + b) * 38
      ctx.lineTo(x, y)
    }
    ctx.lineTo(W, yBase + 90)
    ctx.lineTo(0, yBase + 90)
    ctx.closePath()
    const grd = ctx.createLinearGradient(0, yBase - 40, 0, yBase + 90)
    grd.addColorStop(0, b % 2 ? 'rgba(34,211,238,0.0)' : 'rgba(139,92,246,0.0)')
    grd.addColorStop(0.5, b % 2 ? 'rgba(34,211,238,0.28)' : 'rgba(167,139,250,0.30)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grd
    ctx.fill()
  }

  // Sun glow near horizon
  const sun = ctx.createRadialGradient(W * 0.5, H * 0.55, 10, W * 0.5, H * 0.55, 320)
  sun.addColorStop(0, 'rgba(255,210,150,0.9)')
  sun.addColorStop(0.3, 'rgba(255,160,110,0.5)')
  sun.addColorStop(1, 'rgba(255,160,110,0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, H * 0.2, W, H * 0.6)

  // Horizon line
  ctx.strokeStyle = 'rgba(255,200,160,0.45)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, H * 0.55)
  ctx.lineTo(W, H * 0.55)
  ctx.stroke()

  // Perspective-ish ground grid (denser near horizon)
  ctx.strokeStyle = 'rgba(120,150,220,0.22)'
  ctx.lineWidth = 1
  for (let i = 1; i <= 14; i++) {
    const t = i / 14
    const y = H * 0.55 + Math.pow(t, 1.6) * H * 0.45
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  for (let x = 0; x <= W; x += W / 24) {
    ctx.beginPath()
    ctx.moveTo(x, H * 0.55)
    ctx.lineTo(x, H)
    ctx.stroke()
  }

  // Distant mountains silhouette along the horizon
  ctx.fillStyle = '#1c1340'
  ctx.beginPath()
  ctx.moveTo(0, H * 0.55)
  for (let x = 0; x <= W; x += 64) {
    const h = 30 + Math.abs(Math.sin(x * 0.011) * 70) + Math.abs(Math.cos(x * 0.03) * 30)
    ctx.lineTo(x, H * 0.55 - h)
  }
  ctx.lineTo(W, H * 0.55)
  ctx.closePath()
  ctx.fill()

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), 'image/png'),
  )
  return new File([blob], 'sample-panorama.png', { type: 'image/png' })
}
