import { useStudioStore } from '../store'
import { exportPng } from '../lib/export'
import { useT } from '../i18n'
import { DownloadCloudIcon } from './icons'
import type * as THREE from 'three'

interface Props {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
}

export default function ExportButton({ scene, camera }: Props) {
  const t = useT()
  const exportWidth = useStudioStore((s) => s.exportWidth)
  const exportHeight = useStudioStore((s) => s.exportHeight)
  const isExporting = useStudioStore((s) => s.isExporting)
  const setExporting = useStudioStore((s) => s.setExporting)
  const panoramaImageUrl = useStudioStore((s) => s.panoramaImageUrl)

  const handleExport = () => {
    if (!scene || !camera || isExporting) return
    setExporting(true)
    requestAnimationFrame(() => {
      exportPng(scene, camera, exportWidth, exportHeight)
      setExporting(false)
    })
  }

  return (
    <div className="p-4">
      <button
        onClick={handleExport}
        disabled={!panoramaImageUrl || isExporting}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all grad-btn text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <DownloadCloudIcon width={17} height={17} />
        {isExporting ? t('exporting') : t('exportPng')}
      </button>
    </div>
  )
}
