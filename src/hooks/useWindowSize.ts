import { useEffect, useState } from 'react'

interface WindowSize {
  windowWidth: number
  windowHeight: number
}

export const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState<WindowSize>(() => ({
    windowWidth: window.innerWidth ?? 0,
    windowHeight: window.innerHeight ?? 0,
  }))

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth: nextWidth, innerHeight: nextHeight } = window

      setSize((prev) =>
        prev.windowWidth === nextWidth && prev.windowHeight === nextHeight
          ? prev
          : { windowWidth: nextWidth, windowHeight: nextHeight },
      )
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
