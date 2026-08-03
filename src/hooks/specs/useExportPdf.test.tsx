import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useExportPdf } from '../useExportPdf'

const mockNotifyError = vi.fn()
vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({ notifyError: mockNotifyError }),
}))

const mockSave = vi.fn()
const mockAddImage = vi.fn()
const mockAddPage = vi.fn()
const MockJsPDF = vi.fn(() => ({
  save: mockSave,
  addImage: mockAddImage,
  addPage: mockAddPage,
}))
const mockToPng = vi.fn().mockResolvedValue('data:image/png;base64,abc')

const mockLoadJsPDF = vi.fn()
const mockLoadHtmlToImage = vi.fn()

vi.mock('@/app/utils/lazyPdfExport', () => ({
  loadJsPDF: () => mockLoadJsPDF(),
  loadHtmlToImage: () => mockLoadHtmlToImage(),
}))

describe('useExportPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadJsPDF.mockResolvedValue(MockJsPDF)
    mockLoadHtmlToImage.mockResolvedValue({ toPng: mockToPng })
    // requestAnimationFrame mock
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
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

  it('calls notifyError when export throws (load fails)', async () => {
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

  it('exports PDF successfully with a single page', async () => {
    const { result } = renderHook(() => useExportPdf({ fileName: 'test.pdf', pageWidthPx: 800 }))
    const containerRef = result.current[0]

    const container = document.createElement('div')
    const page = document.createElement('div')
    page.setAttribute('data-report-page', '')
    page.getBoundingClientRect = vi.fn().mockReturnValue({ height: 600, width: 800 })
    container.appendChild(page)
    containerRef.current = container as unknown as HTMLElement

    const exportAsPdf = result.current[1]
    await act(async () => {
      await exportAsPdf()
    })

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith('test.pdf')
    })
  })

  it('exports PDF successfully with multiple pages', async () => {
    const { result } = renderHook(() => useExportPdf({ pageWidthPx: 800 }))
    const containerRef = result.current[0]

    const container = document.createElement('div')
    for (let i = 0; i < 2; i++) {
      const page = document.createElement('div')
      page.setAttribute('data-report-page', '')
      page.getBoundingClientRect = vi.fn().mockReturnValue({ height: 600, width: 800 })
      container.appendChild(page)
    }
    containerRef.current = container as unknown as HTMLElement

    const exportAsPdf = result.current[1]
    await act(async () => {
      await exportAsPdf()
    })

    await waitFor(() => {
      expect(mockAddPage).toHaveBeenCalled()
      expect(mockSave).toHaveBeenCalled()
    })
  })

  it('throws error when no pages found', async () => {
    const { result } = renderHook(() => useExportPdf({}))
    const containerRef = result.current[0]

    const container = document.createElement('div')
    containerRef.current = container as unknown as HTMLElement

    const exportAsPdf = result.current[1]
    await act(async () => {
      await exportAsPdf()
    })

    expect(mockNotifyError).toHaveBeenCalled()
  })
})
