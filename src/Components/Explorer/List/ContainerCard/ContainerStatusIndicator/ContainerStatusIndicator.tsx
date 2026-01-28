import Tooltip from 'antd/es/tooltip'
import { FC } from 'react'

import { MinerStatusIndicatorContainer } from '../../MinerCard/MinerCard.styles'
import ErrorIcon from '../../MinerStatusIndicator/Icons/ErrorIcon'
import OfflineIcon from '../../MinerStatusIndicator/Icons/OfflineIcon'
import { StatusLabel } from '../../MinerStatusIndicator/MinerStatusIndicator'

interface ContainerStatusIndicatorProps {
  isOffline?: boolean
  error?: string
}

const ContainerStatusIndicator: FC<ContainerStatusIndicatorProps> = ({ isOffline, error }) => (
  <MinerStatusIndicatorContainer>
    {isOffline && (
      <StatusLabel $offline>
        <OfflineIcon width={14} height={14} />
      </StatusLabel>
    )}
    {error && (
      <Tooltip title={`Error : ${error}`}>
        <StatusLabel $error>
          <ErrorIcon width={14} height={14} />
        </StatusLabel>
      </Tooltip>
    )}
  </MinerStatusIndicatorContainer>
)

export default ContainerStatusIndicator
