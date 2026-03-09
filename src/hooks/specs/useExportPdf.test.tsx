import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useExportPdf } from '../useExportPdf'

const mockNotifyError = vi.fn()
vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({ notifyError: mockNotifyError }),
}))

const mockLoadJsPDF = vi.fn()
const mockLoadHtmlToImage = vi.fn()
vi.mock('@/app/utils/lazyPdfExport', () => ({
  loadJsPDF: () => mockLoadJsPDF(),
  loadHtmlToImage: () => mockLoadHtmlToImage(),
}))

describe('useExportPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadJsPDF.mockResolvedValue(vi.fn())
    mockLoadHtmlToImage.mockResolvedValue({ toPng: vi.fn().mockResolvedValue('data:image/png;base64,') })
  })

  it('returns containerRef, exportAsPdf, and isExporting', () => {
    const { result } = renderHook(() => useExportPdf({}))
    const [containerRef, exportAsPdf, isExporting] = result.current
    expect(containerRef).toBeDefined()
    expect(containerRef.current).toBeNull()
    expect(typeof exportAsPdf).toBe('function')
    expect(isExporting).toBe(false)
  })

  it('does nothing when exportAsPdf is called and containerRef.current is null', async () => {
    const { result } = renderHook(() => useExportPdf({}))
    const [, exportAsPdf] = result.current
    await act(async () => {
      await exportAsPdf()
    })
    expect(mockLoadJsPDF).not.toHaveBeenCalled()
    expect(mockLoadHtmlToImage).not.toHaveBeenCalled()
  })

  it('calls notifyError when export throws', async () => {
    mockLoadJsPDF.mockRejectedValueOnce(new Error('load failed'))
    const { result } = renderHook(() => useExportPdf({}))
    const containerRef = result.current[0]
    const div = document.createElement('div')
    div.setAttribute('data-report-page', '')
    containerRef.current = div as unknown as HTMLElement
    const exportAsPdf = result.current[1]
    await act(async () => {
      await exportAsPdf()
    })
    expect(mockNotifyError).toHaveBeenCalledWith(
      'Error occurred while exporting PDF. Please try again.',
      'Please check your browser settings and try again.',
    )
  })
})
