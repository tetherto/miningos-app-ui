import _map from 'lodash/map'
import { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { devicesSlice, selectSelectedDevices } from '../../../../app/slices/devicesSlice'
import LabeledCard from '../../../Card/LabeledCard'
import SelectedMinerCard from '../SelectedMinerCard/SelectedMinerCard'

import {
  SelectedMinerCardLabelContainer,
  SelectedMinerCardLabelTitleContainer,
  SelectedMinersListContainer,
  SelectedMinerRemoveAllBtn as Button,
} from './SelectedMinersList.styles'

const { setResetSelections, removeDeviceTag } = devicesSlice.actions

import type { DeviceData } from '@/app/utils/deviceUtils/types'
import type { DeviceTagPayload } from '@/types/redux'

interface SelectedMinersListProps {
  onRemoveDeviceFromSelection?: (device: string) => void
  onRemoveAllSelections?: () => void
}

const SelectedMinersList: FC<SelectedMinersListProps> = ({
  onRemoveDeviceFromSelection,
  onRemoveAllSelections,
}) => {
  const selectedDevices = useSelector(selectSelectedDevices)
  const dispatch = useDispatch()

  const onDelete = (data: DeviceData) => {
    if (data.id) {
      onRemoveDeviceFromSelection?.(data.id)
      const deviceTagPayload: DeviceTagPayload = {
        id: data.id,
        info: data.info || {},
      }
      dispatch(removeDeviceTag(deviceTagPayload))
    }
  }
  const onRemoveAll = () => {
    onRemoveAllSelections?.()
    dispatch(setResetSelections())
  }
  return (
    <LabeledCard
      noMargin
      label={
        <>
          <SelectedMinerCardLabelContainer>
            <SelectedMinerCardLabelTitleContainer>
              Selected {selectedDevices?.length} Miners
            </SelectedMinerCardLabelTitleContainer>
            <Button onClick={onRemoveAll}>Remove All</Button>
          </SelectedMinerCardLabelContainer>
        </>
      }
    >
      <SelectedMinersListContainer>
        {_map(selectedDevices, (device: unknown, index: number) => {
          const deviceData = device as DeviceData
          return (
            <SelectedMinerCard
              onDelete={onDelete}
              key={`${deviceData.id}-${index}`}
              data={deviceData}
            />
          )
        })}
      </SelectedMinersListContainer>
    </LabeledCard>
  )
}

export default SelectedMinersList
