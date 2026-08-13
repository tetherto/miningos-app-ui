import type { ReactNode } from 'react'
import { vi } from 'vitest'

// Minimal Antd mocks - only what's actually needed
// Since no tests are using Antd components, we can keep this minimal

// Mock basic Antd utilities that might be imported indirectly
vi.mock('antd/es/_util/getPrefixCls', () => ({
  default: vi.fn(
    (suffix: string, customizePrefixCls?: string) => customizePrefixCls || `ant-${suffix}`,
  ),
}))

// Mock Antd's warning system
vi.mock('antd/es/_util/warning', () => ({
  default: vi.fn(),
}))

// Mock Antd's theme system
vi.mock('antd/es/theme/useToken', () => ({
  default: vi.fn(() => [{}, 'mock-hash-id'] as const),
  unitless: {},
}))

// Mock Antd's CSS-in-JS library
vi.mock('@ant-design/cssinjs', () => ({
  useCacheToken: vi.fn(() => [{}, 'mock-hash-id', {}] as const),
  useStyleRegister: vi.fn(() => vi.fn()),
  createCache: vi.fn(() => ({})),
  createTheme: vi.fn(() => ({})),
  StyleProvider: vi.fn(({ children }: { children: ReactNode }) => children),
  Keyframes: vi.fn(() => ({})),
}))
