import _isFinite from 'lodash/isFinite'

interface AvgData {
  avg?: number
  totalWeight?: number
}

export const getAvgLast24Hrs = (avgData: AvgData | undefined): number | null =>
  _isFinite(avgData?.avg) && _isFinite(avgData?.totalWeight) && avgData!.totalWeight! > 0
    ? avgData!.avg! / avgData!.totalWeight!
    : null
