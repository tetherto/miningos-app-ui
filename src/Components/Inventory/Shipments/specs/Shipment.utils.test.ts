import { describe, it, expect } from 'vitest'

import { getShipmentItinerary } from '../Shipment.utils'

describe('getShipmentItinerary', () => {
  it('formats source and destination when both are provided', () => {
    const result = getShipmentItinerary({
      source: 'site-a.warehouse',
      destination: 'site-b.lab',
    })
    expect(result).toContain('→')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(1)
  })

  it('uses "Unknown" for missing source', () => {
    const result = getShipmentItinerary({ destination: 'site-b.lab' })
    expect(result).toContain('Unknown')
    expect(result).toContain('→')
  })

  it('uses "Unknown" for missing destination', () => {
    const result = getShipmentItinerary({ source: 'site-a.warehouse' })
    expect(result).toContain('Unknown')
    expect(result).toContain('→')
  })

  it('returns Unknown→Unknown when both are missing', () => {
    const result = getShipmentItinerary({})
    expect(result).toBe('Unknown→Unknown')
  })
})
