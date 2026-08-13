import _head from 'lodash/head'

import { useGetGlobalConfigQuery } from '@/app/services/api'
import { getConsumptionColor } from '@/app/utils/statusUtils'

interface UseConsumptionColorParams {
  consumption?: {
    realValue?: number
    [key: string]: unknown
  }
}

const useConsumptionColor = ({ consumption }: UseConsumptionColorParams) => {
  const { data: globalConfig } = useGetGlobalConfigQuery({})
  const configItem = _head(
    globalConfig as
      | Array<{
          consumptionLevels?: import('@/app/utils/statusUtils').ConsumptionLevels
          [key: string]: unknown
        }>
      | undefined,
  )

  return getConsumptionColor(consumption?.realValue, configItem?.consumptionLevels)
}

export default useConsumptionColor
