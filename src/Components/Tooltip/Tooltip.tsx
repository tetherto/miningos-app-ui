import {
  PropsWithChildren,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useTransition,
  useCallback,
} from 'react'

import { TooltipContainer, TooltipTrigger, TooltipContent } from './Tooltip.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
type TooltipTriggerType = 'hover' | 'click' | 'focus'

interface TooltipProps {
  content?: string | ReactNode
  placement?: TooltipPlacement
  trigger?: TooltipTriggerType
  isVisible?: boolean
  onVisibilityChange?: (visible: boolean) => void
  disabled?: boolean
  delay?: number
  offset?: number
  maxWidth?: number
}

const Tooltip = ({
  children,
  content = '',
  placement = 'top',
  trigger = 'hover',
  isVisible: controlledIsVisible,
  onVisibilityChange,
  disabled = false,
  delay = 0,
  offset = 8,
  maxWidth = 250,
}: PropsWithChildren<TooltipProps>) => {
  const isControlled = controlledIsVisible !== undefined
  const [internalVisible, setInternalVisible] = useState(false)

  const [isPending, startTransition] = useTransition()

  const [position, setPosition] = useState({ top: 0, left: 0 })

  const triggerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isVisible = isControlled ? controlledIsVisible : internalVisible

  const setVisibility = (visible: boolean) => {
    startTransition(() => {
      if (isControlled) {
        onVisibilityChange?.(visible)
      } else {
        setInternalVisible(visible)
      }
    })
  }

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    let top = 0
    let left = 0

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = triggerRect.bottom + offset
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left - tooltipRect.width - offset
        break
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + offset
        break
      default:
        break
    }

    if (left < 0) left = 8
    if (left + tooltipRect.width > viewport.width) {
      left = viewport.width - tooltipRect.width - 8
    }
    if (top < 0) top = 8
    if (top + tooltipRect.height > viewport.height) {
      top = viewport.height - tooltipRect.height - 8
    }

    setPosition({ top, left })
  }, [placement, offset])

  useEffect(() => {
    if (isVisible) {
      calculatePosition()
      window.addEventListener('scroll', calculatePosition, { passive: true })
      window.addEventListener('resize', calculatePosition)
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition)
      window.removeEventListener('resize', calculatePosition)
    }
  }, [isVisible, calculatePosition])

  const showTooltip = () => {
    if (disabled) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisibility(true), delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisibility(false), 100)
  }

  const toggleTooltip = () => {
    if (disabled) return
    setVisibility(!isVisible)
  }

  const getTriggerProps = () => {
    const props: UnknownRecord & { ref: typeof triggerRef } = { ref: triggerRef }
    if (trigger === 'hover') {
      props.onMouseEnter = showTooltip
      props.onMouseLeave = hideTooltip
      props.onFocus = showTooltip
      props.onBlur = hideTooltip
    } else if (trigger === 'click') {
      props.onClick = toggleTooltip
    }
    return props
  }

  const getTooltipProps = () => {
    const props: UnknownRecord & { ref: typeof tooltipRef } = { ref: tooltipRef }
    if (trigger === 'hover') {
      props.onMouseEnter = showTooltip
      props.onMouseLeave = hideTooltip
    }
    return props
  }

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  return (
    <TooltipContainer>
      <TooltipTrigger {...getTriggerProps()}>{children}</TooltipTrigger>

      {(isVisible || isPending) && content && (
        <TooltipContent
          {...getTooltipProps()}
          $maxWidth={maxWidth}
          className={!isVisible && isPending ? 'tooltip-exit' : ''}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 10001,
          }}
        >
          {content}
        </TooltipContent>
      )}
    </TooltipContainer>
  )
}

export default Tooltip
