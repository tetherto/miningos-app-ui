import _every from 'lodash/every'
import _head from 'lodash/head'
import _tail from 'lodash/tail'
import _values from 'lodash/values'
import { FC } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { flexColumn } from '../../../../app/mixins'
import { selectSelectedContainers } from '../../../../app/slices/devicesSlice'
import { getDeviceModel } from '../../../../app/utils/deviceUtils'
import type { Device } from '../../../../app/utils/deviceUtils/types'
import { ContainerControlsBox } from '../../../Container/ContentBox/ContainerControlsBox'
import { ContainerPanel } from '../../Containers/Container.styles'

import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'

const ControlsBoxContainer = styled.div`
  ${flexColumn};
  padding: 5px;
`

interface BatchContainerControlsCardProps {
  isBatch?: boolean
  isCompact?: boolean
  connectedMiners?: unknown
}

const BatchContainerControlsCard: FC<BatchContainerControlsCardProps> = ({
  isBatch = true,
  isCompact,
  connectedMiners,
}) => {
  const selectedContainers = useSelector(selectSelectedContainers)
  const selectedDevices = _values(selectedContainers) as Device[]
  const areAllSameModels = () => {
    if (selectedDevices.length <= 1) {
      return true // If there's only one device or none, models are considered the same
    }
    const firstDeviceModel = getDeviceModel(_head(selectedDevices) as Device)
    return _every(
      _tail(selectedDevices),
      (device: Device) => getDeviceModel(device) === firstDeviceModel,
    )
  }
  const type = areAllSameModels() ? _head(selectedDevices)?.type : undefined

  let controlsBoxData: Record<string, unknown> = { type: type }
  if (selectedDevices.length === 1) {
    controlsBoxData = {
      ...controlsBoxData,
      ...(_head(selectedDevices) as Device),
      connectedMiners,
    }
  }

  return (
    <ContainerPanel $exludeMarginTop>
      <ContentBox title={isBatch ? 'Batch Container Controls' : 'Container Controls'}>
        <ControlsBoxContainer>
          <ContainerControlsBox data={controlsBoxData} isBatch={isBatch} isCompact={isCompact} />
        </ControlsBoxContainer>
      </ContentBox>
    </ContainerPanel>
  )
}

export default BatchContainerControlsCard
