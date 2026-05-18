import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStudioStore } from '../store'
import {
  paintStore,
  projectDirection,
  screenSizeToWorldSize,
  unprojectScreen,
  worldSizeToScreenPx,
} from '../lib/paintStore'
import { usePaintStoreVersion } from '../lib/usePaintStoreVersion'

interface Props {
  cameraGetter: () => THREE.PerspectiveCamera | null
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void
}

interface TextEditor {
  cssX: number
  cssY: number
  direction: THREE.Vector3
  value: string
  editingIndex: number | null
  maxWidth: number
}

const DRAG_THRESHOLD_PX = 3

export default function PaintOverlay({ cameraGetter, onCanvasReady }: Props) {
  const paintMode = useStudioStore((s) => s.paintMode)
  const paintTool = useStudioStore((s) => s.paintTool)
  const paintColor = useStudioStore((s) => s.paintColor)
  const paintSize = useStudioStore((s) => s.paintSize)
  const paintFontSize = useStudioStore((s) => s.paintFontSize)
  const paintClearSignal = useStudioStore((s) => s.paintClearSignal)
  usePaintStoreVersion()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const drawingRef = useRef(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const dragTextIndexRef = useRef<number | null>(null)
  const dragMovedRef = useRef(false)
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null)
  const hoverIndexRef = useRef<number | null>(null)
  const [textEditor, setTextEditor] = useState<TextEditor | null>(null)
  const textEditorRef = useRef<TextEditor | null>(null)
  textEditorRef.current = textEditor
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [hoverTextIndex, setHoverTextIndex] = useState<number | null>(null)
  hoverIndexRef.current = hoverTextIndex

  useEffect(() => {
    onCanvasReady?.(canvasRef.current)
    return () => onCanvasReady?.(null)
  }, [onCanvasReady])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return
    const apply = () => {
      const { width, height } = wrapper.getBoundingClientRect()
      if (width <= 0 || height <= 0) return
      const w = Math.floor(width)
      const h = Math.floor(height)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    paintStore.clear()
    setTextEditor(null)
  }, [paintClearSignal])

  useEffect(() => {
    if (!paintMode) {
      setTextEditor(null)
      setCursor(null)
      setHoverTextIndex(null)
      paintStore.setHiddenText(null)
      paintStore.setSelectedIndex(null)
    }
  }, [paintMode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = (e: WheelEvent) => {
      if (!paintMode || paintTool !== 'text') return
      if (hoverIndexRef.current === null) return
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08
      paintStore.scaleText(hoverIndexRef.current, factor)
    }
    canvas.addEventListener('wheel', handler, { passive: false })
    return () => canvas.removeEventListener('wheel', handler)
  }, [paintMode, paintTool])

  const focusEditor = textEditor !== null
  useEffect(() => {
    if (focusEditor && inputRef.current) {
      const t = setTimeout(() => {
        const el = inputRef.current
        if (!el) return
        el.focus()
        const len = el.value.length
        el.setSelectionRange(len, len)
      }, 30)
      return () => clearTimeout(t)
    }
  }, [focusEditor])

  const getCanvasMetrics = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      cssX: e.clientX - rect.left,
      cssY: e.clientY - rect.top,
      canvasX: (e.clientX - rect.left) * (e.currentTarget.width / rect.width),
      canvasY: (e.clientY - rect.top) * (e.currentTarget.height / rect.height),
      width: e.currentTarget.width,
      height: e.currentTarget.height,
      rectWidth: rect.width,
      rectHeight: rect.height,
    }
  }

  const computeMaxWidth = (cssX: number) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return 300
    const rect = wrapper.getBoundingClientRect()
    return Math.max(80, rect.width - cssX - 16)
  }

  const screenPosToCss = (canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return { cssX: canvasX, cssY: canvasY }
    const rect = wrapper.getBoundingClientRect()
    return {
      cssX: canvasX * (rect.width / canvas.width),
      cssY: canvasY * (rect.height / canvas.height),
    }
  }

  const commitTextEditor = useCallback((editor: TextEditor) => {
    const trimmed = editor.value.replace(/\s+$/g, '')
    if (editor.editingIndex !== null) {
      if (trimmed) {
        paintStore.updateText(editor.editingIndex, trimmed)
        paintStore.setHiddenText(null)
      } else {
        paintStore.removeText(editor.editingIndex)
      }
    } else if (trimmed) {
      const camera = cameraGetter()
      const canvas = canvasRef.current
      if (camera && canvas) {
        const worldSize = screenSizeToWorldSize(paintFontSize, canvas.height, camera)
        paintStore.addText(editor.direction, trimmed, paintColor, worldSize)
      }
    }
  }, [cameraGetter, paintColor, paintFontSize])

  const flushCurrentEditor = useCallback(() => {
    const editor = textEditorRef.current
    if (!editor) return
    commitTextEditor(editor)
    textEditorRef.current = null
    setTextEditor(null)
  }, [commitTextEditor])

  const startEditingExisting = (index: number) => {
    const camera = cameraGetter()
    const canvas = canvasRef.current
    if (!camera || !canvas) return
    const t = paintStore.getTextItem(index)
    if (!t) return
    const sp = projectDirection(t.direction, camera, canvas.width, canvas.height)
    const { cssX, cssY } = screenPosToCss(sp.x, sp.y)
    paintStore.setHiddenText(index)
    paintStore.setSelectedIndex(index)
    setTextEditor({
      cssX,
      cssY,
      direction: t.direction.clone(),
      value: t.value,
      editingIndex: index,
      maxWidth: computeMaxWidth(cssX),
    })
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!paintMode) return
    const camera = cameraGetter()
    const canvas = canvasRef.current
    if (!camera || !canvas) return
    const m = getCanvasMetrics(e)

    // Auto-commit any open editor when clicking on canvas
    if (textEditorRef.current) {
      flushCurrentEditor()
    }

    if (paintTool === 'text') {
      const hit = paintStore.hitTestText(m.canvasX, m.canvasY, canvas, camera)
      if (hit !== null) {
        const t = paintStore.getTextItem(hit)
        if (t) {
          const sp = projectDirection(t.direction, camera, canvas.width, canvas.height)
          dragOffsetRef.current = {
            dx: m.canvasX - sp.x,
            dy: m.canvasY - sp.y,
          }
        } else {
          dragOffsetRef.current = { dx: 0, dy: 0 }
        }
        dragStartRef.current = { x: m.cssX, y: m.cssY }
        dragTextIndexRef.current = hit
        dragMovedRef.current = false
        paintStore.setSelectedIndex(hit)
        paintStore.beginMoveText()
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          // ignore
        }
        return
      }
      // Clicked on empty area — deselect
      paintStore.setSelectedIndex(null)
      const direction = unprojectScreen(m.canvasX, m.canvasY, m.width, m.height, camera)
      paintStore.setSelectedIndex(null)
      setTextEditor({
        cssX: m.cssX,
        cssY: m.cssY,
        direction,
        value: '',
        editingIndex: null,
        maxWidth: computeMaxWidth(m.cssX),
      })
      return
    }

    drawingRef.current = true
    const worldSize = screenSizeToWorldSize(paintSize, m.height, camera)
    paintStore.startStroke(paintTool, paintColor, worldSize)
    const direction = unprojectScreen(m.canvasX, m.canvasY, m.width, m.height, camera)
    paintStore.addPoint(direction)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!paintMode) return
    const camera = cameraGetter()
    const canvas = canvasRef.current
    if (!camera || !canvas) return
    const m = getCanvasMetrics(e)

    // Text drag
    if (dragTextIndexRef.current !== null && dragStartRef.current) {
      const dx = m.cssX - dragStartRef.current.x
      const dy = m.cssY - dragStartRef.current.y
      if (!dragMovedRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
      dragMovedRef.current = true
      const offset = dragOffsetRef.current ?? { dx: 0, dy: 0 }
      const targetX = m.canvasX - offset.dx
      const targetY = m.canvasY - offset.dy
      const direction = unprojectScreen(targetX, targetY, m.width, m.height, camera)
      paintStore.moveText(dragTextIndexRef.current, direction)
      return
    }

    // Brush/eraser cursor indicator
    if (paintTool === 'eraser' || paintTool === 'brush') {
      setCursor({ x: m.cssX, y: m.cssY })
    } else if (cursor !== null) {
      setCursor(null)
    }

    if (paintTool === 'text' && !drawingRef.current) {
      const hit = paintStore.hitTestText(m.canvasX, m.canvasY, canvas, camera)
      if (hit !== hoverTextIndex) setHoverTextIndex(hit)
      if (hit !== null) paintStore.setSelectedIndex(hit)
    } else if (hoverTextIndex !== null) {
      setHoverTextIndex(null)
    }

    if (!drawingRef.current) return
    const dir = unprojectScreen(m.canvasX, m.canvasY, m.width, m.height, camera)
    paintStore.addPoint(dir)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragTextIndexRef.current !== null) {
      const moved = dragMovedRef.current
      paintStore.endMoveText(moved)
      dragStartRef.current = null
      dragTextIndexRef.current = null
      dragMovedRef.current = false
      dragOffsetRef.current = null
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
      return
    }
    if (drawingRef.current) {
      drawingRef.current = false
      paintStore.endStroke()
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    }
  }

  const onPointerEnter = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (paintMode && (paintTool === 'eraser' || paintTool === 'brush')) {
      const m = getCanvasMetrics(e)
      setCursor({ x: m.cssX, y: m.cssY })
    }
  }

  const onPointerLeave = () => {
    setCursor(null)
    setHoverTextIndex(null)
  }

  const onDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!paintMode || paintTool !== 'text') return
    const camera = cameraGetter()
    const canvas = canvasRef.current
    if (!camera || !canvas) return
    const rect = e.currentTarget.getBoundingClientRect()
    const canvasX = (e.clientX - rect.left) * (canvas.width / rect.width)
    const canvasY = (e.clientY - rect.top) * (canvas.height / rect.height)
    const hit = paintStore.hitTestText(canvasX, canvasY, canvas, camera)
    if (hit !== null) {
      // A new "empty" editor may have been created by the first click of the
      // double-click; clear that without committing before opening the edit editor.
      if (textEditorRef.current && textEditorRef.current.editingIndex === null) {
        textEditorRef.current = null
        setTextEditor(null)
      }
      startEditingExisting(hit)
    }
  }

  const commitText = useCallback(() => {
    if (!textEditor) return
    commitTextEditor(textEditor)
    setTextEditor(null)
  }, [textEditor, commitTextEditor])

  const cancelText = useCallback(() => {
    paintStore.setHiddenText(null)
    setTextEditor(null)
  }, [])

  const canvasCursor: string = paintMode
    ? paintTool === 'text'
      ? hoverTextIndex !== null
        ? 'move'
        : 'text'
      : paintTool === 'eraser' || paintTool === 'brush'
        ? 'none'
        : 'crosshair'
    : 'default'

  const showCursorRing = paintMode && cursor !== null && (paintTool === 'brush' || paintTool === 'eraser')
  const ringIsEraser = paintTool === 'eraser'

  let editorColor = paintColor
  let editorFontSizeCss = paintFontSize
  if (textEditor) {
    if (textEditor.editingIndex !== null) {
      const t = paintStore.getTextItem(textEditor.editingIndex)
      if (t) {
        editorColor = t.color
        const camera = cameraGetter()
        const canvas = canvasRef.current
        const wrapperRect = wrapperRef.current?.getBoundingClientRect()
        if (camera && canvas && wrapperRect) {
          const fontPx = worldSizeToScreenPx(t.worldSize, canvas.height, camera)
          editorFontSizeCss = Math.max(8, fontPx * (wrapperRect.height / canvas.height))
        }
      }
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0"
      style={{ pointerEvents: paintMode ? 'auto' : 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          pointerEvents: paintMode ? 'auto' : 'none',
          cursor: canvasCursor,
          touchAction: paintMode ? 'none' : 'auto',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onDoubleClick={onDoubleClick}
      />
      {showCursorRing && cursor && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: cursor.x - paintSize / 2,
            top: cursor.y - paintSize / 2,
            width: paintSize,
            height: paintSize,
            backgroundColor: ringIsEraser ? 'rgba(244, 114, 182, 0.35)' : `${paintColor}55`,
            border: `1px solid ${ringIsEraser ? 'rgba(244, 114, 182, 0.9)' : paintColor}`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
          }}
        />
      )}
      {textEditor && (
        <textarea
          ref={inputRef}
          rows={1}
          value={textEditor.value}
          onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onBlur={commitText}
          onKeyDown={(e) => {
            e.stopPropagation()
            const composing = isComposing || (e.nativeEvent as KeyboardEvent).isComposing
            if (e.key === 'Enter' && !e.shiftKey && !composing) {
              e.preventDefault()
              commitText()
            } else if (e.key === 'Escape' && !composing) {
              e.preventDefault()
              cancelText()
            }
          }}
          className="absolute outline-none px-1 py-0 bg-black/40 backdrop-blur-sm rounded resize-none overflow-hidden"
          style={
            {
              left: textEditor.cssX,
              top: textEditor.cssY,
              color: editorColor,
              fontSize: `${editorFontSizeCss}px`,
              fontFamily: 'sans-serif',
              fontWeight: 'bold',
              border: `1px dashed ${editorColor}`,
              minWidth: '40px',
              maxWidth: `${textEditor.maxWidth}px`,
              lineHeight: 1.18,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fieldSizing: 'content',
            } as React.CSSProperties
          }
        />
      )}
    </div>
  )
}
