import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockJsPDF = vi.fn()
const mockHtml2Canvas = vi.fn()

vi.mock('jspdf', () => ({ default: mockJsPDF }))
vi.mock('html-to-image', () => ({ toPng: vi.fn() }))
vi.mock('html2canvas', () => ({ default: mockHtml2Canvas }))

describe('lazyPdfExport', () => {
  beforeEach(async () => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('loadJsPDF', () => {
    it('loads and caches jsPDF; second call returns cached instance', async () => {
      const { loadJsPDF } = await import('../lazyPdfExport')
      const first = await loadJsPDF()
      const second = await loadJsPDF()
      expect(first).toBe(mockJsPDF)
      expect(second).toBe(mockJsPDF)
    })
  })

  describe('loadHtmlToImage', () => {
    it('loads and caches html-to-image; second call returns cached module', async () => {
      const { loadHtmlToImage } = await import('../lazyPdfExport')
      const first = await loadHtmlToImage()
      const second = await loadHtmlToImage()
      expect(first).toHaveProperty('toPng')
      expect(first).toBe(second)
    })
  })

  describe('loadHtml2Canvas', () => {
    it('loads and caches html2canvas; second call returns cached default', async () => {
      const { loadHtml2Canvas } = await import('../lazyPdfExport')
      const first = await loadHtml2Canvas()
      const second = await loadHtml2Canvas()
      expect(first).toBe(mockHtml2Canvas)
      expect(second).toBe(mockHtml2Canvas)
    })
  })
})
