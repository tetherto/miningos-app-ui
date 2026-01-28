import _isArray from 'lodash/isArray'
import _isNil from 'lodash/isNil'
import _isString from 'lodash/isString'
import _map from 'lodash/map'

import LabeledCard from '../../../Card/LabeledCard'
import { DeviceInfo } from '../../../InfoContainer/InfoContainer'

interface MinerInfoCardProps {
  data?: Array<{ title: string; value: unknown }>
  isDark?: boolean
  label?: string
}

interface InfoItem {
  title?: string
  value?: string | string[]
  [key: string]: unknown
}

const MinerInfoCard = ({ data, isDark, label = 'Miner info' }: MinerInfoCardProps) => {
  // Convert unknown values to string | string[] | undefined
  const convertedData: InfoItem[] | undefined = _map(data, (item) => {
    let value: string | string[] | undefined

    if (_isNil(item.value)) {
      value = undefined
    } else if (_isString(item.value)) {
      value = item.value
    } else if (_isArray(item.value)) {
      value = _map(item.value, (v) => String(v))
    } else {
      value = String(item.value)
    }

    return {
      title: item.title,
      value,
    }
  })

  return (
    <LabeledCard isDark={isDark} label={label} underline={false} scrollable noMargin>
      <DeviceInfo data={convertedData} />
    </LabeledCard>
  )
}

export default MinerInfoCard
