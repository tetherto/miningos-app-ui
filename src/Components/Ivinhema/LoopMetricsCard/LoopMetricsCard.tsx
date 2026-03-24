import _map from 'lodash/map'

import { LOOP_METRICS_DATA } from './LoopMetricsCard.const'
import {
  LoopMetricsBody,
  LoopMetricsGrid,
  LoopMetricsInfo,
  LoopMetricsUnit,
  LoopMetricsValue,
  LoopMetricsTitle,
  LoopMetricsValueRow,
} from './LoopMetricsCard.styles'

import ContentPanel from '@/Components/Ivinhema/ContentPanel/ContentPanel'

const LoopMetricsCard = () => (
  <LoopMetricsGrid>
    {_map(LOOP_METRICS_DATA, ({ title, value, unit, info }) => (
      <ContentPanel key={title}>
        <LoopMetricsBody>
          <LoopMetricsTitle>{title}</LoopMetricsTitle>
          <LoopMetricsValueRow>
            <LoopMetricsValue>{value}</LoopMetricsValue>
            <LoopMetricsUnit>{unit}</LoopMetricsUnit>
          </LoopMetricsValueRow>
          <LoopMetricsInfo>{info}</LoopMetricsInfo>
        </LoopMetricsBody>
      </ContentPanel>
    ))}
  </LoopMetricsGrid>
)

export default LoopMetricsCard
