import Col from 'antd/es/col'

import IconRow from '../IconRow/IconRow'
import { DangerDeviceCardColText, DeviceCardColText, DeviceCardContainer } from '../ListView.styles'
import BTC from '../MinerCard/Icons/BTC'
import HashRateIcon from '../MinerCard/Icons/HashRate'

import { getHashrateString } from '@/app/utils/deviceUtils'
import type { Device } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { decimalToMegaNumber } from '@/app/utils/numberUtils'
import { useIsRevenueReportEnabled } from '@/hooks/usePermissions'

interface MinerPoolCardProps {
  device: Device | null | undefined
  isHighlighted: boolean
}

const MinerPoolCard = ({ device, isHighlighted }: MinerPoolCardProps) => {
  const isRevenueReportEnabled = useIsRevenueReportEnabled()

  if (!device) return
  const { id, type, rack, last } = device

  if (!last) return
  const { err, snap } = last

  if (!snap)
    return (
      <DeviceCardContainer>
        <Col span={1} />
        <DangerDeviceCardColText>
          {err} | {id} | {rack}
        </DangerDeviceCardColText>
      </DeviceCardContainer>
    )

  const stats = snap?.stats as
    | { hashrate?: number; revenue_24h?: number; active_workers_count?: number }
    | undefined
  const { hashrate, revenue_24h, active_workers_count } = stats || {}
  return (
    <DeviceCardContainer $isHighlighted={isHighlighted}>
      <Col md={12} span={11}>
        <DeviceCardColText>
          {id} | {type}
        </DeviceCardColText>
      </Col>
      <Col md={4} span={4}>
        <IconRow
          icon={<HashRateIcon />}
          text={
            <DeviceCardColText>
              {hashrate !== undefined ? getHashrateString(decimalToMegaNumber(hashrate)) : '-'}
            </DeviceCardColText>
          }
        />
      </Col>
      <Col md={4} span={4}>
        {isRevenueReportEnabled && (
          <IconRow
            icon={<BTC />}
            text={
              <DeviceCardColText>
                {revenue_24h !== undefined ? formatNumber(revenue_24h) : '-'}
              </DeviceCardColText>
            }
          />
        )}
      </Col>
      <Col md={3} span={4}>
        <DeviceCardColText>
          {active_workers_count !== undefined ? formatNumber(active_workers_count) : '-'}
        </DeviceCardColText>
      </Col>
    </DeviceCardContainer>
  )
}

export default MinerPoolCard
