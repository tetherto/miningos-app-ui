import _indexOf from 'lodash/indexOf'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import type { KeyboardEventHandler } from 'react'
import { useState } from 'react'

import {
  BtcSatToggleButtonText,
  BtcSatToggleButton,
  BtcSatToggleContainer,
} from './BtcSatToggle.styles'

import { CURRENCY } from '@/constants/units'

const BTC_LABEL = CURRENCY.BTC_LABEL
const SAT_LABEL = CURRENCY.SAT_LABEL

export type BitcoinUnit = typeof BTC_LABEL | typeof SAT_LABEL

export interface BtcSatToggleProps {
  value?: BitcoinUnit
  defaultValue?: BitcoinUnit
  disabled?: boolean
  width?: number | string
  height?: number | string
  fullWidth?: boolean
  fullHeight?: boolean
  ariaLabel?: string
  onChange?: (value: BitcoinUnit) => void
}

const toCssPx = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value

const BtcSatToggle = ({
  value,
  defaultValue = BTC_LABEL,
  disabled = false,
  width,
  height,
  fullWidth = false,
  fullHeight = false,
  ariaLabel = 'Bitcoin unit',
  onChange = _noop,
}: BtcSatToggleProps) => {
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState<BitcoinUnit>(defaultValue)
  const selectedValue = (isControlled ? value : uncontrolledValue) ?? BTC_LABEL

  const cssHeight = toCssPx(height)
  const effectiveHeight = cssHeight ?? (fullHeight ? '100%' : undefined)
  const minHeight = cssHeight ?? '40px'

  const handleSelect = (next: BitcoinUnit) => {
    if (disabled || next === selectedValue) return
    if (!isControlled) {
      setUncontrolledValue(next)
    }
    onChange(next)
  }

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return

    const options = [BTC_LABEL, SAT_LABEL] as const
    const currentIndex = _indexOf(options, selectedValue)
    if (currentIndex === -1) return

    const move = (delta: number) => {
      const next = options[(currentIndex + delta + options.length) % options.length]
      e.preventDefault()
      handleSelect(next)
    }

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        move(-1)
        break
      case 'ArrowRight':
      case 'ArrowDown':
        move(1)
        break
      case 'Home':
        e.preventDefault()
        handleSelect(options[0])
        break
      case 'End':
        e.preventDefault()
        handleSelect(options[options.length - 1])
        break
      default:
        break
    }
  }

  return (
    <BtcSatToggleContainer
      aria-label={ariaLabel}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      $width={fullWidth ? '100%' : toCssPx(width)}
      $height={effectiveHeight}
      $minHeight={minHeight}
    >
      {_map([BTC_LABEL, SAT_LABEL], (opt) => {
        const selected = opt === selectedValue
        return (
          <BtcSatToggleButton
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            tabIndex={selected ? 0 : -1}
            $selected={selected}
            onClick={() => handleSelect(opt)}
            onKeyDown={handleKeyDown}
          >
            <BtcSatToggleButtonText>{opt}</BtcSatToggleButtonText>
          </BtcSatToggleButton>
        )
      })}
    </BtcSatToggleContainer>
  )
}

export default BtcSatToggle
