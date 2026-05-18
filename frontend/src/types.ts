export interface ExportPreset {
  label: string
  width: number
  height: number
}

export const EXPORT_PRESETS: ExportPreset[] = [
  { label: 'YouTube 動画背景 (1920×1080)', width: 1920, height: 1080 },
  { label: 'YouTube Shorts (1080×1920)', width: 1080, height: 1920 },
  { label: 'サムネイル (1280×720)', width: 1280, height: 720 },
  { label: 'Instagram 正方形 (1024×1024)', width: 1024, height: 1024 },
  { label: 'Instagram 4:5 (1080×1350)', width: 1080, height: 1350 },
]

export type Language = 'ja' | 'en' | 'zh'
