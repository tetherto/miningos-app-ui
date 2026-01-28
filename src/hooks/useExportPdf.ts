import { useRef, useState } from 'react'

import { loadJsPDF, loadHtmlToImage } from '@/app/utils/lazyPdfExport'
import { COLOR } from '@/constants/colors'
import { useNotification } from '@/hooks/useNotification'

const nextFrame = () =>
  new Promise<number>((r: (value: number) => void) => requestAnimationFrame(r))

const INITIAL_PX_RATIO = 2

interface UseExportPdfParams {
  pageWidthPx?: number
  pixelRatio?: number
  fileName?: string
  backgroundColor?: string
}

export const useExportPdf = ({
  pageWidthPx,
  pixelRatio = INITIAL_PX_RATIO,
  fileName = 'report.pdf',
  backgroundColor = COLOR.RICH_BLACK,
}: UseExportPdfParams = {}) => {
  const { notifyError } = useNotification()
  const containerRef = useRef<HTMLElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const exportAsPdf = async () => {
    if (!containerRef.current || isExporting) return
    setIsExporting(true)

    try {
      // Lazy load PDF libraries only when export is triggered
      const [jsPDF, { toPng }] = await Promise.all([loadJsPDF(), loadHtmlToImage()])

      await nextFrame()
      const pages = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>('[data-report-page]'),
      )
      if (!pages.length) throw new Error('No report pages found')

      let pdf: InstanceType<typeof jsPDF> | null = null

      for (let i = 0; i < pages.length; i++) {
        const node = pages[i] as HTMLElement
        const rect = node.getBoundingClientRect()
        const pageHeightPx = rect.height

        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio,
          backgroundColor,
          width: pageWidthPx,
          height: pageHeightPx,
          style: { transform: 'none', transformOrigin: 'top left' },
        })

        if (i === 0) {
          pdf = new jsPDF({
            orientation: (pageWidthPx || 800) > pageHeightPx ? 'landscape' : 'portrait',
            unit: 'px',
            format: [pageWidthPx || 800, pageHeightPx],
          })
        } else {
          pdf?.addPage(
            [pageWidthPx || 800, pageHeightPx],
            (pageWidthPx || 800) > pageHeightPx ? 'landscape' : 'portrait',
          )
        }

        pdf?.addImage(dataUrl, 'PNG', 0, 0, pageWidthPx || 800, pageHeightPx, undefined, 'FAST')
      }

      pdf?.save(fileName)
    } catch {
      notifyError(
        'Error occurred while exporting PDF. Please try again.',
        'Please check your browser settings and try again.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  return [containerRef, exportAsPdf, isExporting]
}
