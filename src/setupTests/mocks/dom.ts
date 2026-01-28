import _create from 'lodash/create'
import _noop from 'lodash/noop'
import { vi } from 'vitest'

// Mock HTMLCanvasElement for chart libraries
interface MockCanvasRenderingContext2D {
  fillRect: () => void
  clearRect: () => void
  getImageData: (x: number, y: number, w: number, h: number) => { data: number[] }
  putImageData: () => void
  createImageData: () => ImageData[]
  setTransform: () => void
  drawImage: () => void
  save: () => void
  fillText: () => void
  restore: () => void
  beginPath: () => void
  moveTo: () => void
  lineTo: () => void
  closePath: () => void
  stroke: () => void
  translate: () => void
  scale: () => void
  rotate: () => void
  arc: () => void
  fill: () => void
  measureText: (text: string) => { width: number; height: number }
  transform: () => void
  rect: () => void
  clip: () => void
}

global.HTMLCanvasElement.prototype.getContext = (() =>
  ({
    fillRect: _noop,
    clearRect: _noop,
    getImageData: (x: number, y: number, w: number, h: number) => ({ data: new Array(w * h * 4) }),
    putImageData: _noop,
    createImageData: () => [],
    setTransform: _noop,
    drawImage: _noop,
    save: _noop,
    fillText: _noop,
    restore: _noop,
    beginPath: _noop,
    moveTo: _noop,
    lineTo: _noop,
    closePath: _noop,
    stroke: _noop,
    translate: _noop,
    scale: _noop,
    rotate: _noop,
    arc: _noop,
    fill: _noop,
    measureText: (text: string) => ({ width: 12 * text.length, height: 14 }),
    transform: _noop,
    rect: _noop,
    clip: _noop,
  }) as unknown as MockCanvasRenderingContext2D) as unknown as typeof HTMLCanvasElement.prototype.getContext

// Mock URL methods
global.URL.createObjectURL = vi.fn()
global.URL.revokeObjectURL = vi.fn()

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Prevent process.version errors
if (typeof process !== 'undefined') {
  const originalProcess = process
  const safeProcess = _create(originalProcess) as typeof process

  Object.defineProperties(safeProcess, {
    version: {
      value: 'v18.20.4',
      configurable: true,
      writable: false,
    },
    versions: {
      value: { node: '18.20.4' },
      configurable: true,
      writable: false,
    },
    env: {
      value: {
        ...originalProcess.env,
        NODE_ENV: 'test',
      },
      configurable: true,
      writable: true,
    },
  })

  global.process = safeProcess
}
