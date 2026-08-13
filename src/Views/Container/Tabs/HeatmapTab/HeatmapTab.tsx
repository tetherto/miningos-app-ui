import type { UnknownRecord } from '../../../../app/utils/deviceUtils'
import { PduTab } from '../PduTab/PduTab'

interface HeatmapTabProps {
  data: {
    last?: UnknownRecord
    connectedMiners?: UnknownRecord[]
    type?: string
    info?: UnknownRecord
  }
}

export const HeatmapTab = ({ data }: HeatmapTabProps) => <PduTab isHeatmapMode data={data} />
