import { create } from 'zustand'
import type { Language } from './types'

export type PaintTool = 'brush' | 'eraser' | 'text'
export type CameraTool = 'pan' | 'tilt'

interface StudioState {
  panoramaImageUrl: string | null
  panoramaFileName: string | null
  setPanoramaImage: (url: string, name: string) => void
  clearPanoramaImage: () => void

  cameraTool: CameraTool
  setCameraTool: (tool: CameraTool) => void

  cameraRoll: number
  setCameraRoll: (roll: number) => void

  showOutputGuide: boolean
  toggleOutputGuide: () => void

  panoramaFov: number
  setPanoramaFov: (fov: number) => void

  exportWidth: number
  exportHeight: number
  isExporting: boolean
  setExportResolution: (width: number, height: number) => void
  setExporting: (exporting: boolean) => void

  brightness: number
  setBrightness: (v: number) => void
  saturation: number
  setSaturation: (v: number) => void
  hueShift: number
  setHueShift: (v: number) => void

  language: Language
  setLanguage: (lang: Language) => void

  paintMode: boolean
  setPaintMode: (on: boolean) => void
  paintTool: PaintTool
  setPaintTool: (tool: PaintTool) => void
  paintColor: string
  setPaintColor: (color: string) => void
  paintSize: number
  setPaintSize: (size: number) => void
  paintFontSize: number
  setPaintFontSize: (size: number) => void
  paintClearSignal: number
  clearPaint: () => void
}

const detectInitialLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'ja'
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('zh')) return 'zh'
  if (lang.startsWith('en')) return 'en'
  return 'ja'
}

export const useStudioStore = create<StudioState>((set) => ({
  panoramaImageUrl: null,
  panoramaFileName: null,
  setPanoramaImage: (url, name) => set({ panoramaImageUrl: url, panoramaFileName: name }),
  clearPanoramaImage: () => set({ panoramaImageUrl: null, panoramaFileName: null }),

  cameraTool: 'pan',
  setCameraTool: (tool) => set({ cameraTool: tool }),

  cameraRoll: 0,
  setCameraRoll: (roll) => set({ cameraRoll: roll }),

  showOutputGuide: true,
  toggleOutputGuide: () => set((s) => ({ showOutputGuide: !s.showOutputGuide })),

  panoramaFov: 120,
  setPanoramaFov: (fov) => set({ panoramaFov: Math.max(30, Math.min(120, fov)) }),

  exportWidth: 1920,
  exportHeight: 1080,
  isExporting: false,
  setExportResolution: (width, height) => set({ exportWidth: width, exportHeight: height }),
  setExporting: (exporting) => set({ isExporting: exporting }),

  brightness: 1,
  setBrightness: (v) => set({ brightness: Math.max(0.2, Math.min(2, v)) }),
  saturation: 1,
  setSaturation: (v) => set({ saturation: Math.max(0, Math.min(2, v)) }),
  hueShift: 0,
  setHueShift: (v) => set({ hueShift: Math.max(-180, Math.min(180, v)) }),

  language: detectInitialLanguage(),
  setLanguage: (lang) => set({ language: lang }),

  paintMode: false,
  setPaintMode: (on) => set({ paintMode: on }),
  paintTool: 'brush',
  setPaintTool: (tool) => set({ paintTool: tool }),
  paintColor: '#ff3030',
  setPaintColor: (color) => set({ paintColor: color }),
  paintSize: 6,
  setPaintSize: (size) => set({ paintSize: Math.max(1, Math.min(50, size)) }),
  paintFontSize: 32,
  setPaintFontSize: (size) => set({ paintFontSize: Math.max(10, Math.min(200, size)) }),
  paintClearSignal: 0,
  clearPaint: () => set((s) => ({ paintClearSignal: s.paintClearSignal + 1 })),
}))
