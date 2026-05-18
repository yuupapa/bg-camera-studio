import { useCallback, useRef, useState } from 'react'
import * as THREE from 'three'
import { useStudioStore } from '../store'
import { loadTextureFromFile } from '../lib/texture-loader'
import { createSamplePanorama } from '../lib/sampleImage'
import { useT } from '../i18n'
import type { PanoramaScene } from '../lib/PanoramaScene'
import { DownloadCloudIcon, CubeIcon } from './icons'

interface Props {
  panoramaScene: PanoramaScene | null
  renderer: THREE.WebGLRenderer | null
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']

export default function ImageDropZone({ panoramaScene, renderer }: Props) {
  const t = useT()
  const panoramaImageUrl = useStudioStore((s) => s.panoramaImageUrl)
  const setPanoramaImage = useStudioStore((s) => s.setPanoramaImage)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED.includes(file.type)) return
      const url = URL.createObjectURL(file)
      setPanoramaImage(url, file.name)
      if (panoramaScene) {
        const texture = await loadTextureFromFile(file, renderer ?? undefined)
        panoramaScene.loadTexture(texture)
      }
    },
    [panoramaScene, renderer, setPanoramaImage],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ''
    },
    [handleFile],
  )

  const loadSample = useCallback(async () => {
    const file = await createSamplePanorama()
    await handleFile(file)
  }, [handleFile])

  if (panoramaImageUrl) return null

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-10"
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={onFileInput}
      />
      <div
        className={`relative w-[420px] max-w-[80%] rounded-3xl glass px-10 py-12 flex flex-col items-center text-center transition-all duration-200 ${
          dragging
            ? 'ring-2 ring-studio-cyan shadow-glow-cyan scale-[1.02]'
            : 'shadow-card'
        }`}
        style={{
          boxShadow: dragging
            ? '0 0 50px rgba(34,211,238,0.4)'
            : '0 0 0 1px rgba(139,92,246,0.35), 0 0 60px rgba(139,92,246,0.18)',
        }}
      >
        <div className="absolute inset-0 rounded-3xl pointer-events-none border border-studio-accent/30" />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-4 cursor-pointer group"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-studio-accent/30 to-studio-indigo/30 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <DownloadCloudIcon width={36} height={36} className="text-studio-accent2" />
          </div>
          <div>
            <div className="text-base font-semibold text-studio-text">
              {t('panoramaDropPrompt')}
            </div>
            <div className="text-sm text-studio-muted mt-1">{t('orClickSelect')}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={loadSample}
          className="mt-8 flex items-center gap-2 px-5 py-2.5 rounded-xl glass-soft text-sm text-studio-text hover:border-studio-accent/40 hover:bg-white/[0.04] transition-colors"
        >
          <CubeIcon width={16} height={16} className="text-studio-cyan" />
          {t('loadSample')}
        </button>
      </div>
    </div>
  )
}
