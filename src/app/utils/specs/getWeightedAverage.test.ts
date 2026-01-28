import { getWeightedAverage } from '../getWeightedAverage'

describe('getWeightedAverage', () => {
  it('calculates correct weighted average for valid data', () => {
    const data = [
      { score: 80, weight: 2 },
      { score: 90, weight: 3 },
    ]

    const result = getWeightedAverage(data, 'score', 'weight')
    expect(result.avg).toBe(86) // (80*2 + 90*3) / (2+3)
  })

  it('returns 0 for empty array', () => {
    const result = getWeightedAverage([], 'score', 'weight')
    expect(result.avg).toBe(0)
  })

  it('handles missing values gracefully', () => {
    const data = [
      { score: 80 }, // no weight
      { weight: 3 }, // no score
    ]

    const result = getWeightedAverage(data, 'score', 'weight')
    expect(result.avg).toBe(0)
  })

  it('ignores invalid weights or scores (NaN)', () => {
    const data = [
      { score: 80, weight: 'two' }, // invalid weight
      { score: 'ninety', weight: 3 }, // invalid score
      { score: 100, weight: 5 },
    ]

    const result = getWeightedAverage(data, 'score', 'weight')
    expect(result.avg).toBe(100) // only one valid point
  })

  it('works with nested attributes', () => {
    const data = [
      { meta: { score: 50 }, stats: { weight: 1 } },
      { meta: { score: 100 }, stats: { weight: 3 } },
    ]

    const result = getWeightedAverage(data, 'meta.score', 'stats.weight')
    expect(result.avg).toBe(87.5) // (50*1 + 100*3)/4
  })
})
