import { CHART_COLORS } from '@/constants/colors'
import { CURRENCY } from '@/constants/units'
import { DONUT_CHART_SETTINGS } from '@/MultiSiteViews/Charts/constants'

type DatasetItem = {
  value: number
  color: string
}

export const getChartData = ({
  operationsCost,
  energyCost,
}: {
  operationsCost?: number
  energyCost?: number
}) => {
  const dataset: { [key: string]: DatasetItem } = {}

  if (operationsCost) {
    dataset.Operations = {
      value: operationsCost,
      color: CHART_COLORS.VIOLET,
    }
  }

  if (energyCost) {
    dataset.Energy = {
      value: energyCost,
      color: CHART_COLORS.SKY_BLUE,
    }
  }

  return {
    dataset,
    unit: CURRENCY.USD,
    label: null,
    value: null,
    ...DONUT_CHART_SETTINGS,
  }
}
