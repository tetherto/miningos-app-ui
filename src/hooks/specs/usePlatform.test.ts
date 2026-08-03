import { renderHook, act } from '@testing-library/react'

import usePlatform from '../usePlatform'

const setUserAgent = (ua: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
    writable: true,
  })
}

describe('usePlatform', () => {
  afterEach(() => {
    // restore jsdom default
    setUserAgent('Mozilla/5.0 (linux) AppleWebKit')
  })

  it('detects iOS from iPhone user agent', async () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)')
    const { result } = renderHook(() => usePlatform())
    // useEffect runs async, wait for state update
    await act(async () => {})
    expect(result.current).toBe('iOS')
  })

  it('detects Android', async () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 11; Pixel 5)')
    const { result } = renderHook(() => usePlatform())
    await act(async () => {})
    expect(result.current).toBe('Android')
  })

  it('detects macOS', async () => {
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    const { result } = renderHook(() => usePlatform())
    await act(async () => {})
    expect(result.current).toBe('Mac')
  })

  it('detects Windows', async () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    const { result } = renderHook(() => usePlatform())
    await act(async () => {})
    expect(result.current).toBe('Windows')
  })

  it('detects Linux', async () => {
    setUserAgent('Mozilla/5.0 (X11; Ubuntu; Linux x86_64)')
    const { result } = renderHook(() => usePlatform())
    await act(async () => {})
    expect(result.current).toBe('Linux')
  })

  it('returns unknown for unrecognized user agent', async () => {
    setUserAgent('CustomBrowser/1.0')
    const { result } = renderHook(() => usePlatform())
    await act(async () => {})
    expect(result.current).toBe('unknown')
  })
})
