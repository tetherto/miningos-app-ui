import { useEffect, useState } from 'react'

const useSubtractedTime = (diff: number, intvl = 5000): number => {
  const [time, setTime] = useState(Date.now() - diff)
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now() - diff)
    }, intvl)
    return () => clearInterval(interval)
  }, [diff, intvl])

  return time
}

export default useSubtractedTime
