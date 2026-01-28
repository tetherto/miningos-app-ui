import ActionsTickIcon from '../Icons/ActionsTickIcon'

import { PendingTasksCountContainer, Value, ValueContainer } from './PendingActionsMenu.styles'

import { formatCountTo99Plus } from '@/app/utils/sharedUtils'

interface PendingTasksCountProps {
  value?: number
  color?: string
  [key: string]: unknown
}

const PendingTasksCount = ({ value, color, ...props }: PendingTasksCountProps) => (
  <PendingTasksCountContainer {...props}>
    <Value $color={color} $value={value}>
      <ActionsTickIcon />
      <ValueContainer>{formatCountTo99Plus(value)}</ValueContainer>
    </Value>
  </PendingTasksCountContainer>
)

export { PendingTasksCount }
