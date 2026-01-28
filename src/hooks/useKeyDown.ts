import { useState, useEffect } from 'react'

export const useKeyDown = (keyName: string): boolean => {
  const [isKeyDown, setIsKeyDown] = useState<boolean>(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === keyName) {
        setIsKeyDown(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent): void => {
      if (e.key === keyName) {
        setIsKeyDown(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [keyName])

  return isKeyDown
}
