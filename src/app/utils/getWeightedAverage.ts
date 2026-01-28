import _get from 'lodash/get'
import _reduce from 'lodash/reduce'

interface WeightedAverageResult {
  avg: number
  totalWeight: number
  weightedValue: number
}

interface WeightedData {
  weightedValue: number
  totalWeight: number
}

export const getWeightedAverage = (
  arr: unknown[],
  valueAttribute: string,
  weightAttribute: string,
): WeightedAverageResult => {
  const { weightedValue, totalWeight } = _reduce<unknown, WeightedData>(
    arr,
    (acc: WeightedData, curr: unknown) => {
      const value = Number(_get(curr, valueAttribute, 0))
      const weight = Number(_get(curr, weightAttribute, 0))
      if (!isNaN(value) && !isNaN(weight)) {
        acc.totalWeight += weight
        acc.weightedValue += value * weight
      }
      return acc
    },
    { weightedValue: 0, totalWeight: 0 },
  )

  return { avg: totalWeight === 0 ? 0 : weightedValue / totalWeight, totalWeight, weightedValue }
}
