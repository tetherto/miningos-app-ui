import { useEffect, useRef, useState } from 'react'

interface UseGridRowSpanParams {
  rowHeight?: number
  gap?: number
}

export const useGridRowSpan = ({ rowHeight = 75, gap = 15 }: UseGridRowSpanParams = {}) => {
  const ref = useRef<HTMLElement | null>(null)
  const [span, setSpan] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const resizeObserver = new ResizeObserver(() => {
      const height = el.getBoundingClientRect().height
      const calculatedSpan = Math.ceil((height + gap) / (rowHeight + gap))
      setSpan((prev) => (prev !== calculatedSpan ? calculatedSpan : prev))
    })

    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [rowHeight, gap])

  return { ref, span }
}
