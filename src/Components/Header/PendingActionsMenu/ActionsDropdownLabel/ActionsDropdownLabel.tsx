import { formatDistance } from 'date-fns/formatDistance'
import _head from 'lodash/head'

import { ACTIONS_SIDEBAR_TYPES } from '../../../ActionsSidebar/ActionsSidebar.types'
import RightNavigateToIcon from '../../../Icons/RightNavigateToIcon'
import {
  ActionsDropdownLabelContainer,
  ActionsDropdownLabelInnerContainer,
  LabelBodyText,
  LabelHeaderText,
} from '../PendingActionsMenu.styles'

import { ACTION_NAMES_MAP } from '@/constants/actions'

type ActionSidebarType = string

interface ActionDataItem {
  action: string
  id: string | number
  params?: [string, number | boolean][][]
  votesPos?: string[]
  requiredPerms?: string[]
  length?: number
  [key: string]: unknown
}

interface ActionsDropdownLabelProps {
  dataItem: ActionDataItem
  type: ActionSidebarType
}

export const ActionsDropdownLabel = ({ dataItem, type }: ActionsDropdownLabelProps) => {
  const isValidDate = (dateString: unknown): dateString is string | number => {
    const parsedDate = new Date(dateString as string | number)
    return !isNaN(parsedDate.getTime())
  }

  const getLabelHeaderText = (dataItem: ActionDataItem, type: ActionSidebarType): string =>
    `${ACTION_NAMES_MAP[dataItem.action as keyof typeof ACTION_NAMES_MAP]} ${type}`

  const getTimeDistance = () => {
    const isValidTimeId = isValidDate(dataItem.id)
    return isValidTimeId
      ? formatDistance(new Date(dataItem.id as string | number), new Date(), {
          addSuffix: true,
        })
      : ''
  }

  if (type === ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION) {
    return (
      <ActionsDropdownLabelContainer $action={dataItem.action as string}>
        <ActionsDropdownLabelInnerContainer>
          <LabelHeaderText>{dataItem.length || 0} - Actions Pending Submission</LabelHeaderText>
        </ActionsDropdownLabelInnerContainer>
        <RightNavigateToIcon />
      </ActionsDropdownLabelContainer>
    )
  }
  if (type === ACTIONS_SIDEBAR_TYPES.REQUESTED) {
    return (
      <ActionsDropdownLabelContainer $action={dataItem.action as string}>
        <ActionsDropdownLabelInnerContainer>
          <LabelHeaderText>{_head(dataItem.votesPos || [])}</LabelHeaderText>
          <LabelBodyText>
            <strong>{(dataItem.requiredPerms || []).join(',')}</strong>{' '}
            {getLabelHeaderText(dataItem, type)}
          </LabelBodyText>
          <LabelBodyText>#{dataItem.id}</LabelBodyText>
          <LabelBodyText>{getTimeDistance()}</LabelBodyText>
        </ActionsDropdownLabelInnerContainer>
        <RightNavigateToIcon />
      </ActionsDropdownLabelContainer>
    )
  }
  return (
    <ActionsDropdownLabelContainer $action={dataItem.action as string}>
      <ActionsDropdownLabelInnerContainer>
        <LabelHeaderText>{getLabelHeaderText(dataItem, type)}</LabelHeaderText>
        <LabelBodyText>#{dataItem.id}</LabelBodyText>
        <LabelBodyText>{getTimeDistance()}</LabelBodyText>
      </ActionsDropdownLabelInnerContainer>
      <RightNavigateToIcon />
    </ActionsDropdownLabelContainer>
  )
}
