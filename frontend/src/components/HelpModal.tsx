import { useEffect } from 'react'
import { useStudioStore } from '../store'
import type { Language } from '../types'
import { BrushIcon, HandIcon, TiltIcon } from './icons'

// ── Content per language ───────────────────────────────────────────────────

type HelpContent = {
  title: string
  close: string
  sections: {
    label: string
    items: { key: string; desc: string }[]
  }[]
  shortcuts: { key: string; desc: string }[]
  shortcutsTitle: string
  exportTitle: string
  exportItems: string[]
}

const CONTENT: Record<Language, HelpContent> = {
  ja: {
    title: 'ヘルプ — 使い方ガイド',
    close: '閉じる',
    shortcutsTitle: 'キーボードショートカット',
    exportTitle: 'PNG 書き出し',
    sections: [
      {
        label: '画像を読み込む',
        items: [
          { key: 'ドラッグ & ドロップ', desc: '360° パノラマ画像（JPEG / PNG / WebP）を中央エリアにドロップ' },
          { key: 'クリック選択', desc: '中央エリアをクリックしてファイルダイアログから選択' },
          { key: 'サンプル', desc: 'サイドバー下部の「サンプルを読み込む」でデモ画像を表示' },
        ],
      },
      {
        label: 'ツール（キャンバス上ツールバー）',
        items: [
          { key: 'Pan（移動）', desc: 'ドラッグで視点を左右・上下に回転。スクロールでズーム（FOV 30°〜120°）' },
          { key: 'Tilt（傾き）', desc: 'ドラッグで画面を左右に傾ける。パネルのスライダーで角度を微調整、リセットボタンで 0° に戻す' },
          { key: 'Paint（ペイント）', desc: 'ブラシ・消しゴム・テキストで画面に書き込み。サイドバーで色・太さ・文字サイズを調整' },
        ],
      },
    ],
    shortcuts: [
      { key: 'Ctrl + Z / ⌘Z', desc: 'ペイントを 1 ステップ元に戻す' },
      { key: 'Ctrl + Shift + Z / ⌘⇧Z', desc: 'やり直す' },
      { key: 'Ctrl + Y / ⌘Y', desc: 'やり直す' },
      { key: 'Delete / Backspace', desc: '選択中のテキストを削除' },
    ],
    exportItems: [
      'サイドバー上部の出力プリセットを選択（YouTube / Shorts / サムネイル / Instagram 等）',
      'カスタムサイズも入力可能',
      '「出力ガイド」をオンにすると書き出し範囲をオーバーレイで確認できる',
      '「PNG 書き出し」ボタンを押すと現在の視点・ペイントを合成して保存',
    ],
  },
  en: {
    title: 'Help — User Guide',
    close: 'Close',
    shortcutsTitle: 'Keyboard Shortcuts',
    exportTitle: 'Export PNG',
    sections: [
      {
        label: 'Loading an Image',
        items: [
          { key: 'Drag & Drop', desc: 'Drop a 360° panorama image (JPEG / PNG / WebP) into the center canvas area' },
          { key: 'Click to Select', desc: 'Click the center area to open a file picker dialog' },
          { key: 'Sample', desc: 'Click "Load sample" at the bottom of the sidebar to preview a demo panorama' },
        ],
      },
      {
        label: 'Tools (Canvas Toolbar)',
        items: [
          { key: 'Pan', desc: 'Drag to rotate the view. Scroll to zoom (FOV 30°–120°)' },
          { key: 'Tilt', desc: 'Drag left/right to roll the camera. Use the angle panel to fine-tune or reset to 0°' },
          { key: 'Paint', desc: 'Draw with brush, erase, or add text labels. Adjust color, size, and font in the sidebar' },
        ],
      },
    ],
    shortcuts: [
      { key: 'Ctrl + Z / ⌘Z', desc: 'Undo last paint stroke' },
      { key: 'Ctrl + Shift + Z / ⌘⇧Z', desc: 'Redo' },
      { key: 'Ctrl + Y / ⌘Y', desc: 'Redo' },
      { key: 'Delete / Backspace', desc: 'Delete selected text label' },
    ],
    exportItems: [
      'Choose an export preset from the sidebar (YouTube, Shorts, Thumbnail, Instagram, etc.)',
      'Enter a custom width/height if needed',
      'Toggle "Output guide" to preview the crop area as an overlay',
      'Click "Export PNG" to save the current view with paint annotations',
    ],
  },
  zh: {
    title: '帮助 — 使用指南',
    close: '关闭',
    shortcutsTitle: '键盘快捷键',
    exportTitle: '导出 PNG',
    sections: [
      {
        label: '加载图像',
        items: [
          { key: '拖放', desc: '将 360° 全景图像（JPEG / PNG / WebP）拖入中央画布区域' },
          { key: '点击选择', desc: '点击中央区域打开文件选择对话框' },
          { key: '示例图像', desc: '点击侧栏底部的「加载示例」显示演示全景图' },
        ],
      },
      {
        label: '工具（画布工具栏）',
        items: [
          { key: 'Pan（平移）', desc: '拖动旋转视角，滚动缩放（FOV 30°–120°）' },
          { key: 'Tilt（倾斜）', desc: '左右拖动倾斜画面，使用角度面板微调或一键重置为 0°' },
          { key: 'Paint（绘制）', desc: '画笔、橡皮或文字标注，在侧栏调整颜色、粗细和字号' },
        ],
      },
    ],
    shortcuts: [
      { key: 'Ctrl + Z / ⌘Z', desc: '撤销上一笔绘制' },
      { key: 'Ctrl + Shift + Z / ⌘⇧Z', desc: '重做' },
      { key: 'Ctrl + Y / ⌘Y', desc: '重做' },
      { key: 'Delete / Backspace', desc: '删除选中的文字标注' },
    ],
    exportItems: [
      '在侧栏选择输出预设（YouTube、Shorts、缩略图、Instagram 等）',
      '也可手动输入自定义宽高',
      '开启「输出参考框」可在画面上预览裁剪区域',
      '点击「导出 PNG」将当前视角与绘制内容合成并保存',
    ],
  },
}

// ── Sub-components ─────────────────────────────────────────────────────────

const TOOL_ICONS: Record<string, typeof BrushIcon> = {
  Pan: HandIcon,
  'Pan（移動）': HandIcon,
  'Pan（平移）': HandIcon,
  Tilt: TiltIcon,
  'Tilt（傾き）': TiltIcon,
  'Tilt（倾斜）': TiltIcon,
  Paint: BrushIcon,
  'Paint（ペイント）': BrushIcon,
  'Paint（绘制）': BrushIcon,
}

function Section({ label, items }: { label: string; items: { key: string; desc: string }[] }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-studio-accent2 mb-2.5">{label}</h3>
      <div className="space-y-2">
        {items.map(({ key, desc }) => {
          const Icon = TOOL_ICONS[key]
          return (
            <div key={key} className="flex gap-3 items-start">
              {Icon ? (
                <span className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded-lg bg-white/[0.06] text-studio-accent2">
                  <Icon width={13} height={13} />
                </span>
              ) : (
                <span className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center" />
              )}
              <div className="min-w-0">
                <span className="text-[13px] font-semibold text-studio-text">{key}</span>
                <span className="text-[12px] text-studio-muted"> — {desc}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Modal ─────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
}

export default function HelpModal({ onClose }: Props) {
  const lang = useStudioStore((s) => s.language)
  const c = CONTENT[lang]

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,3,14,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal card */}
      <div className="glass rounded-2xl shadow-card w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-studio-accent2 text-lg">?</span>
            <h2 className="text-[14px] font-bold text-studio-text">{c.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="icon-btn w-8 h-8 text-lg font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Operation sections */}
          {c.sections.map((s) => (
            <Section key={s.label} label={s.label} items={s.items} />
          ))}

          <div className="border-t border-white/[0.05]" />

          {/* Color adjustments */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-studio-accent2 mb-2.5">
              {lang === 'ja' ? '色・明るさ調整' : lang === 'zh' ? '色彩与亮度' : 'Color & Brightness'}
            </h3>
            <div className="text-[12px] text-studio-muted leading-relaxed space-y-1">
              {lang === 'ja' && <>
                <p>サイドバーの「色・明るさ調整」パネルから 3 つのスライダーで調整できます。</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[['明るさ','0.2〜2.0（中央が等倍）'],['彩度','0〜2.0（0 でグレースケール）'],['色温度','−180°〜+180°']].map(([k,v])=>(
                    <div key={k} className="rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                      <div className="text-[11px] font-semibold text-studio-text">{k}</div>
                      <div className="text-[10px] text-studio-muted">{v}</div>
                    </div>
                  ))}
                </div>
              </>}
              {lang === 'en' && <>
                <p>Use the "Color & Brightness" panel in the sidebar to fine-tune the panorama.</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[['Brightness','0.2–2.0'],['Saturation','0–2.0 (0 = grayscale)'],['Color Temp','−180° to +180°']].map(([k,v])=>(
                    <div key={k} className="rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                      <div className="text-[11px] font-semibold text-studio-text">{k}</div>
                      <div className="text-[10px] text-studio-muted">{v}</div>
                    </div>
                  ))}
                </div>
              </>}
              {lang === 'zh' && <>
                <p>在侧栏的「色彩与亮度」面板中使用三个滑块进行调整。</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[['亮度','0.2〜2.0'],['饱和度','0〜2.0（0为灰度）'],['色温','−180°〜+180°']].map(([k,v])=>(
                    <div key={k} className="rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                      <div className="text-[11px] font-semibold text-studio-text">{k}</div>
                      <div className="text-[10px] text-studio-muted">{v}</div>
                    </div>
                  ))}
                </div>
              </>}
            </div>
          </div>

          <div className="border-t border-white/[0.05]" />

          {/* Export */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-studio-accent2 mb-2.5">{c.exportTitle}</h3>
            <ol className="space-y-1.5 list-none">
              {c.exportItems.map((item, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="shrink-0 w-4 h-4 mt-0.5 rounded-full bg-studio-accent2/20 text-studio-accent2 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-[12px] text-studio-muted">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t border-white/[0.05]" />

          {/* Keyboard shortcuts */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-studio-accent2 mb-2.5">{c.shortcutsTitle}</h3>
            <div className="space-y-1.5">
              {c.shortcuts.map(({ key, desc }) => (
                <div key={key} className="flex items-center gap-3">
                  <kbd className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.05] text-studio-muted whitespace-nowrap">
                    {key}
                  </kbd>
                  <span className="text-[12px] text-studio-muted">{desc}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.06] shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs px-4 py-1.5 rounded-lg border border-white/10 text-studio-muted hover:text-studio-text hover:bg-white/5 transition-all"
          >
            {c.close}
          </button>
        </div>
      </div>
    </div>
  )
}
