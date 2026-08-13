import Tag from 'antd/es/tag'
import _isBoolean from 'lodash/isBoolean'
import { FC } from 'react'

import { DEVICE_STATUS } from '../../../../../app/utils/statusUtils'

import { StyledStartedOption } from './UnitControlBox.styles'

import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import { StatusLabelColors } from '@/Theme/GlobalColors'

interface PumpStationControlBoxProps {
  title?: string
  alarmStatus?: unknown
  ready?: unknown
  operation?: unknown
  start?: unknown
}

const PumpStationControlBox: FC<PumpStationControlBoxProps> = ({
  title,
  alarmStatus,
  ready,
  operation,
  start,
}) => {
  const getNotTextFromStatus = (status: boolean) => !status && 'Not '

  return (
    <ContentBox title={title}>
      <Tag color={StatusLabelColors[alarmStatus ? DEVICE_STATUS.ERROR : DEVICE_STATUS.RUNNING]}>
        {alarmStatus ? 'Fault' : 'Normal'}
      </Tag>
      {_isBoolean(ready) && (
        <StyledStartedOption $isOn={ready}>{getNotTextFromStatus(ready)}Ready</StyledStartedOption>
      )}
      {_isBoolean(operation) && (
        <StyledStartedOption $isOn={operation}>
          {getNotTextFromStatus(operation)}Operating
        </StyledStartedOption>
      )}
      {_isBoolean(start) && (
        <StyledStartedOption $isOn={start}>
          {getNotTextFromStatus(start)}Started
        </StyledStartedOption>
      )}
    </ContentBox>
  )
}

export default PumpStationControlBox
