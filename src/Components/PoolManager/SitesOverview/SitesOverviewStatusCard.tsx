import Checkbox from 'antd/es/checkbox'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import _isNil from 'lodash/isNil'
import type { FC, MouseEvent } from 'react'

import {
  SITE_OVERVIEW_STATUS_COLORS,
  SITE_OVERVIEW_STATUS_LABELS,
  SITE_OVERVIEW_STATUSES,
} from '../PoolManager.constants'

import {
  Card,
  Header,
  InfoList,
  InfoListItem,
  StatusBadge,
  UnitInfo,
  UnitName,
} from './SitesOverviewStatusCard.styles'

interface SitesOverviewStatusCardProps {
  id?: number
  unit: string
  pool?: string
  hashrate: string | number
  miners: string | number
  overrides?: number
  status?: keyof typeof SITE_OVERVIEW_STATUS_COLORS
  onSelect: (e: CheckboxChangeEvent) => void
  onClick: () => void
  checked: boolean
  selectable?: boolean
}

const STATUS_DEFAULT: Required<SitesOverviewStatusCardProps>['status'] =
  SITE_OVERVIEW_STATUSES.OFFLINE

const SitesOverviewStatusCard: FC<SitesOverviewStatusCardProps> = ({
  unit,
  hashrate,
  miners,
  status = STATUS_DEFAULT,
  onSelect,
  onClick,
  checked,
  selectable = true,
  pool,
  overrides,
}) => (
  <Card onClick={onClick}>
    <Header>
      <UnitInfo>
        {selectable && (
          <Checkbox
            checked={checked}
            onClick={(e: MouseEvent) => e.stopPropagation()}
            onChange={onSelect}
          />
        )}
        <UnitName>{unit}</UnitName>
      </UnitInfo>
      {/* TODO: Override status should be shown here once API is available */}
      <StatusBadge
        $textColor={
          SITE_OVERVIEW_STATUS_COLORS[status] ?? SITE_OVERVIEW_STATUS_COLORS[STATUS_DEFAULT]
        }
      >
        {SITE_OVERVIEW_STATUS_LABELS[status] ?? SITE_OVERVIEW_STATUS_LABELS[STATUS_DEFAULT]}
      </StatusBadge>
    </Header>

    <InfoList>
      <InfoListItem>
        Pool: <span>{pool}</span>
      </InfoListItem>
      <InfoListItem>
        Hashrate: <span>{hashrate}</span>
      </InfoListItem>
      <InfoListItem>
        Miners: <span>{miners}</span>
      </InfoListItem>
      <InfoListItem $primary={!_isNil(overrides) && overrides > 0}>
        Overrides: <span>{overrides}</span>
      </InfoListItem>
    </InfoList>
  </Card>
)

export default SitesOverviewStatusCard
