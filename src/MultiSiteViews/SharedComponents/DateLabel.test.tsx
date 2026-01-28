// Rename this file to DateLabel.test.tsx
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DateLabel } from './DateLabel'

// Mock the timezone hook
vi.mock('@/hooks/useTimezone', () => ({
  default: (() => ({
    timezone: 'Europe/Madrid',
  })) as () => { timezone: string },
}))

// Mock date-fns-tz
vi.mock('date-fns-tz', () => ({
  toZonedTime: vi.fn((date: Date, timezone: string): Date => {
    // Mock timezone conversion - in real scenario this would convert to Madrid time
    // For testing, we'll simulate a +2 hour offset
    const offset = timezone === 'Europe/Madrid' ? 2 : 0
    return new Date(date.getTime() + offset * 60 * 60 * 1000)
  }),
}))

describe('DateLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render period label with dates', () => {
    const startDate = new Date('2024-09-22T00:00:00Z')
    const endDate = new Date('2024-09-28T23:59:59Z')

    render(<DateLabel startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('PERIOD:')).toBeInTheDocument()
    expect(screen.getByText('22/09/24')).toBeInTheDocument()
    expect(screen.getByText('29/09/24')).toBeInTheDocument()
  })

  it('should handle invalid dates gracefully', () => {
    render(<DateLabel startDate={null} endDate={undefined} />)

    expect(screen.getByText('PERIOD:')).toBeInTheDocument()
    expect(screen.getAllByText('--/--/--')).toHaveLength(2)
  })

  it('should handle NaN dates', () => {
    const invalidDate = new Date('invalid')

    render(<DateLabel startDate={invalidDate} endDate={invalidDate} />)

    expect(screen.getByText('PERIOD:')).toBeInTheDocument()
    expect(screen.getAllByText('--/--/--')).toHaveLength(2)
  })

  it('should format dates correctly in different timezone', () => {
    const startDate = new Date('2024-09-22T22:00:00Z') // 22:00 UTC = 00:00 Madrid
    const endDate = new Date('2024-09-28T21:59:59Z') // 21:59 UTC = 23:59 Madrid

    render(<DateLabel startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('23/09/24')).toBeInTheDocument()
    expect(screen.getByText('28/09/24')).toBeInTheDocument()
  })

  it('should handle same day range', () => {
    const sameDate = new Date('2024-09-22T12:00:00Z')

    render(<DateLabel startDate={sameDate} endDate={sameDate} />)

    expect(screen.getByText('PERIOD:')).toBeInTheDocument()
    expect(screen.getAllByText('22/09/24')).toHaveLength(2)
  })

  it('should handle cross-month dates', () => {
    const startDate = new Date('2024-09-29T00:00:00Z')
    const endDate = new Date('2024-10-05T23:59:59Z')

    render(<DateLabel startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('PERIOD:')).toBeInTheDocument()
    expect(screen.getByText('29/09/24')).toBeInTheDocument()
    expect(screen.getByText('06/10/24')).toBeInTheDocument()
  })
})
