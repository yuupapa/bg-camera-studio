import * as THREE from 'three'

export type StrokeKind = 'brush' | 'eraser'

export interface Stroke {
  kind: StrokeKind
  color: string
  worldSize: number
  points: THREE.Vector3[]
}

export interface TextItem {
  direction: THREE.Vector3
  value: string
  color: string
  worldSize: number
}

interface HistoryEntry {
  strokes: Stroke[]
  texts: TextItem[]
}

type Subscriber = () => void

const TEXT_LINE_HEIGHT = 1.18
const HISTORY_LIMIT = 50

export class PaintStore {
  strokes: Stroke[] = []
  texts: TextItem[] = []
  hiddenTextIndex: number | null = null
  selectedIndex: number | null = null
  private current: Stroke | null = null
  private history: HistoryEntry[] = []
  private redoStack: HistoryEntry[] = []
  private dragSnapshot: HistoryEntry | null = null
  private listeners = new Set<Subscriber>()

  subscribe(fn: Subscriber): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn())
  }

  private deepSnapshot(): HistoryEntry {
    return {
      strokes: this.strokes.map((s) => ({
        kind: s.kind,
        color: s.color,
        worldSize: s.worldSize,
        points: s.points.map((p) => p.clone()),
      })),
      texts: this.texts.map((t) => ({
        direction: t.direction.clone(),
        value: t.value,
        color: t.color,
        worldSize: t.worldSize,
      })),
    }
  }

  private pushHistory() {
    this.history.push(this.deepSnapshot())
    if (this.history.length > HISTORY_LIMIT) this.history.shift()
    this.redoStack = []
  }

  canUndo(): boolean {
    return this.history.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  undo() {
    const prev = this.history.pop()
    if (!prev) return
    this.redoStack.push(this.deepSnapshot())
    this.strokes = prev.strokes
    this.texts = prev.texts
    this.hiddenTextIndex = null
    this.selectedIndex = null
    this.current = null
    this.notify()
  }

  redo() {
    const next = this.redoStack.pop()
    if (!next) return
    this.history.push(this.deepSnapshot())
    if (this.history.length > HISTORY_LIMIT) this.history.shift()
    this.strokes = next.strokes
    this.texts = next.texts
    this.hiddenTextIndex = null
    this.selectedIndex = null
    this.current = null
    this.notify()
  }

  startStroke(kind: StrokeKind, color: string, worldSize: number) {
    this.current = { kind, color, worldSize, points: [] }
  }

  addPoint(direction: THREE.Vector3) {
    if (!this.current) return
    this.current.points.push(direction.clone().normalize())
  }

  endStroke() {
    if (this.current && this.current.points.length > 0) {
      this.pushHistory()
      this.strokes.push(this.current)
      this.notify()
    }
    this.current = null
  }

  addText(direction: THREE.Vector3, value: string, color: string, worldSize: number): number {
    this.pushHistory()
    this.texts.push({ direction: direction.clone().normalize(), value, color, worldSize })
    this.notify()
    return this.texts.length - 1
  }

  updateText(index: number, value: string) {
    const t = this.texts[index]
    if (!t) return
    if (t.value === value) return
    this.pushHistory()
    t.value = value
    this.notify()
  }

  beginMoveText() {
    this.dragSnapshot = this.deepSnapshot()
  }

  moveText(index: number, direction: THREE.Vector3) {
    const t = this.texts[index]
    if (!t) return
    t.direction = direction.clone().normalize()
    this.notify()
  }

  endMoveText(moved: boolean) {
    if (moved && this.dragSnapshot) {
      this.history.push(this.dragSnapshot)
      if (this.history.length > HISTORY_LIMIT) this.history.shift()
    }
    this.dragSnapshot = null
  }

  removeText(index: number) {
    if (index < 0 || index >= this.texts.length) return
    this.pushHistory()
    this.texts.splice(index, 1)
    if (this.hiddenTextIndex === index) this.hiddenTextIndex = null
    else if (this.hiddenTextIndex !== null && this.hiddenTextIndex > index) {
      this.hiddenTextIndex -= 1
    }
    this.notify()
  }

  private scaleSession: { index: number; snapshot: HistoryEntry; timeoutId: number } | null = null

  scaleText(index: number, factor: number) {
    const t = this.texts[index]
    if (!t) return
    if (!this.scaleSession || this.scaleSession.index !== index) {
      if (this.scaleSession) {
        window.clearTimeout(this.scaleSession.timeoutId)
        this.history.push(this.scaleSession.snapshot)
        if (this.history.length > HISTORY_LIMIT) this.history.shift()
      }
      this.scaleSession = {
        index,
        snapshot: this.deepSnapshot(),
        timeoutId: 0,
      }
    }
    window.clearTimeout(this.scaleSession.timeoutId)
    this.scaleSession.timeoutId = window.setTimeout(() => {
      const s = this.scaleSession
      if (!s) return
      this.history.push(s.snapshot)
      if (this.history.length > HISTORY_LIMIT) this.history.shift()
      this.scaleSession = null
    }, 400)
    t.worldSize = Math.max(0.005, Math.min(3, t.worldSize * factor))
    this.notify()
  }

  setHiddenText(index: number | null) {
    this.hiddenTextIndex = index
    this.notify()
  }

  setSelectedIndex(index: number | null) {
    if (this.selectedIndex === index) return
    this.selectedIndex = index
    this.notify()
  }

  setTextWorldSize(index: number, worldSize: number) {
    const t = this.texts[index]
    if (!t) return
    const clamped = Math.max(0.005, Math.min(3, worldSize))
    if (t.worldSize === clamped) return
    // Use the same scaling session machinery for history batching
    const factor = clamped / t.worldSize
    if (factor !== 1) {
      this.scaleText(index, factor)
    }
  }

  clear() {
    const had = this.strokes.length > 0 || this.texts.length > 0 || this.current !== null
    if (had) this.pushHistory()
    this.strokes = []
    this.texts = []
    this.current = null
    this.hiddenTextIndex = null
    this.selectedIndex = null
    if (had) this.notify()
  }

  isEmpty(): boolean {
    return this.strokes.length === 0 && this.texts.length === 0 && this.current === null
  }

  hitTestText(
    canvasX: number,
    canvasY: number,
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera,
  ): number | null {
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const fovRad = (camera.fov * Math.PI) / 180
    const pxPerRad = canvas.height / (2 * Math.tan(fovRad / 2))
    for (let i = this.texts.length - 1; i >= 0; i--) {
      if (i === this.hiddenTextIndex) continue
      const t = this.texts[i]!
      const sp = projectDirection(t.direction, camera, canvas.width, canvas.height)
      if (!sp.inFront) continue
      const fontPx = Math.max(6, t.worldSize * pxPerRad)
      const bounds = measureTextBounds(ctx, t.value, fontPx)
      const pad = Math.max(6, fontPx * 0.2)
      if (
        canvasX >= sp.x - pad &&
        canvasX <= sp.x + bounds.width + pad &&
        canvasY >= sp.y - pad &&
        canvasY <= sp.y + bounds.height + pad
      ) {
        return i
      }
    }
    return null
  }

  getTextItem(index: number): TextItem | null {
    return this.texts[index] ?? null
  }

  render(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (this.isEmpty()) return

    const fovRad = (camera.fov * Math.PI) / 180
    const pxPerRad = canvas.height / (2 * Math.tan(fovRad / 2))

    const drawStroke = (s: Stroke) => {
      if (s.points.length === 0) return
      const widthPx = Math.max(0.5, s.worldSize * pxPerRad)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = widthPx
      if (s.kind === 'brush') {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = s.color
      } else {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = 'rgba(0,0,0,1)'
      }

      ctx.beginPath()
      let started = false
      for (const dir of s.points) {
        const sp = projectDirection(dir, camera, canvas.width, canvas.height)
        if (!sp.inFront) {
          started = false
          continue
        }
        if (!started) {
          ctx.moveTo(sp.x, sp.y)
          started = true
        } else {
          ctx.lineTo(sp.x, sp.y)
        }
      }
      if (s.points.length === 1) {
        const sp = projectDirection(s.points[0]!, camera, canvas.width, canvas.height)
        if (sp.inFront) {
          ctx.arc(sp.x, sp.y, widthPx / 2, 0, Math.PI * 2)
          if (s.kind === 'brush') {
            ctx.fillStyle = s.color
          } else {
            ctx.fillStyle = 'rgba(0,0,0,1)'
          }
          ctx.fill()
        }
      } else {
        ctx.stroke()
      }
    }

    for (const s of this.strokes) drawStroke(s)
    if (this.current) drawStroke(this.current)

    ctx.globalCompositeOperation = 'source-over'
    for (let i = 0; i < this.texts.length; i++) {
      if (i === this.hiddenTextIndex) continue
      const t = this.texts[i]!
      const sp = projectDirection(t.direction, camera, canvas.width, canvas.height)
      if (!sp.inFront) continue
      const fontPx = Math.max(6, t.worldSize * pxPerRad)
      ctx.fillStyle = t.color
      ctx.font = `bold ${fontPx}px sans-serif`
      ctx.textBaseline = 'top'
      const lines = t.value.split('\n')
      lines.forEach((line, li) => {
        ctx.fillText(line, sp.x, sp.y + li * fontPx * TEXT_LINE_HEIGHT)
      })

      if (i === this.selectedIndex) {
        const bounds = measureTextBounds(ctx, t.value, fontPx)
        const pad = Math.max(4, fontPx * 0.12)
        ctx.save()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([5, 4])
        ctx.strokeRect(sp.x - pad, sp.y - pad, bounds.width + pad * 2, bounds.height + pad * 2)
        ctx.restore()
      }
    }
  }
}

function measureTextBounds(
  ctx: CanvasRenderingContext2D,
  value: string,
  fontPx: number,
): { width: number; height: number } {
  ctx.save()
  ctx.font = `bold ${fontPx}px sans-serif`
  const lines = value.split('\n')
  let maxWidth = 0
  for (const line of lines) {
    const w = ctx.measureText(line).width
    if (w > maxWidth) maxWidth = w
  }
  ctx.restore()
  return {
    width: maxWidth,
    height: lines.length * fontPx * TEXT_LINE_HEIGHT,
  }
}

export function unprojectScreen(
  canvasX: number,
  canvasY: number,
  canvasW: number,
  canvasH: number,
  camera: THREE.PerspectiveCamera,
): THREE.Vector3 {
  const ndcX = (canvasX / canvasW) * 2 - 1
  const ndcY = -(canvasY / canvasH) * 2 + 1
  const v = new THREE.Vector3(ndcX, ndcY, 0.5)
  v.unproject(camera)
  return v.sub(camera.position).normalize()
}

export function projectDirection(
  dir: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  canvasW: number,
  canvasH: number,
): { x: number; y: number; inFront: boolean } {
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
  const inFront = dir.dot(forward) > 0
  const worldPoint = new THREE.Vector3().copy(dir).add(camera.position)
  const ndc = worldPoint.clone().project(camera)
  return {
    x: (ndc.x + 1) * 0.5 * canvasW,
    y: (1 - ndc.y) * 0.5 * canvasH,
    inFront,
  }
}

export function worldSizeToScreenPx(
  worldSize: number,
  canvasHeight: number,
  camera: THREE.PerspectiveCamera,
): number {
  const fovRad = (camera.fov * Math.PI) / 180
  const pxPerRad = canvasHeight / (2 * Math.tan(fovRad / 2))
  return worldSize * pxPerRad
}

export function screenSizeToWorldSize(
  screenPx: number,
  canvasHeight: number,
  camera: THREE.PerspectiveCamera,
): number {
  const fovRad = (camera.fov * Math.PI) / 180
  const pxPerRad = canvasHeight / (2 * Math.tan(fovRad / 2))
  return screenPx / pxPerRad
}

export const paintStore = new PaintStore()
