import { useEffect, useState } from 'react'

const useLineChartTimeline = (statKey: string) => {
  const [timeline, setTimeline] = useState(statKey ? statKey : '5m')
  const [end, setEnd] = useState<number | undefined>(undefined)

  useEffect(() => {
    setTimeline(statKey ? statKey : '5m')
  }, [statKey])

  const handleSetEnd = (value: number) => {
    setEnd(value)
  }

  return { end, setEnd: handleSetEnd, timeline, setTimeline }
}

export default useLineChartTimeline
