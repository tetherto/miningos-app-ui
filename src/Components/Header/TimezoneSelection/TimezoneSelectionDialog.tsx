import Input from 'antd/es/input'
import List from 'antd/es/list'
import Typography from 'antd/es/typography'
import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _toLower from 'lodash/toLower'
import _trim from 'lodash/trim'
import { useState } from 'react'

import { DATE_TIME_FORMAT } from '../../../constants/dates'
import useTimezone from '../../../hooks/useTimezone'

import {
  ListContainer,
  SearchBarContainer,
  SelectedTimezoneContainer,
  StyledTimezoneSelectionModal,
  StyledTimezonesList,
} from './TimezoneSelection.styles'

const { Search } = Input

interface TimezoneSelectionDialogProps {
  open?: boolean
  handleCancel?: () => void
}

export const TimezoneSelectionDialog = ({ open, handleCancel }: TimezoneSelectionDialogProps) => {
  const { changeTimezone, timezone, getFormattedDate } = useTimezone()

  // Intl.supportedValuesOf may not be available in all TypeScript versions
  const getAvailableTimezones = (): string[] => {
    try {
      const intlWithSupport = Intl as typeof Intl & {
        supportedValuesOf?: (key: string) => string[]
      }
      if ('supportedValuesOf' in Intl && _isFunction(intlWithSupport.supportedValuesOf)) {
        return ['UTC', ...intlWithSupport.supportedValuesOf('timeZone')]
      }
      // Fallback for older environments
      return ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']
    } catch {
      return ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']
    }
  }
  const availableTimezones = getAvailableTimezones()
  const [timezones, setTimezones] = useState(availableTimezones)

  const onTimezonesSearch = (event: unknown) => {
    const searchValue =
      _isObject(event) && event !== null && 'target' in event
        ? String((event as { target: { value: unknown } }).target.value)
        : ''
    const filteredTimezones = _filter(availableTimezones, (zone: string) =>
      _includes(_toLower(_trim(zone)), _toLower(_trim(searchValue))),
    )
    setTimezones(filteredTimezones)
  }

  return (
    <StyledTimezoneSelectionModal
      onCancel={handleCancel}
      footer={false}
      title="Select Timezone"
      open={open}
    >
      <SelectedTimezoneContainer>Current Selected Timezone: {timezone}</SelectedTimezoneContainer>
      <SearchBarContainer>
        <Search placeholder="Search" onChange={onTimezonesSearch} allowClear />
      </SearchBarContainer>
      <ListContainer>
        <StyledTimezonesList
          bordered
          dataSource={timezones}
          renderItem={(timeZone: unknown) => (
            <List.Item onClick={() => changeTimezone(String(timeZone))}>
              <Typography.Text mark></Typography.Text>{' '}
              {`${timeZone} - ${getFormattedDate(new Date(), timeZone as string, DATE_TIME_FORMAT)}`}
            </List.Item>
          )}
        />
      </ListContainer>
    </StyledTimezoneSelectionModal>
  )
}
