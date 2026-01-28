import Alert from 'antd/es/alert'
import Tooltip from 'antd/es/tooltip'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _sum from 'lodash/sum'
import _values from 'lodash/values'
import type React from 'react'
import { FC } from 'react'

import { formatNumber } from '../../../../app/utils/format'

import {
  MINERS_ACTIVITY_ITEMS,
  MINERS_ACTIVITY_LABELS,
  MINERS_ACTIVITY_TOOLTIPS,
  SKELETON_MIN_HEIGHT_DEFAULT,
  SKELETON_MIN_HEIGHT_LARGE,
} from './MinersActivityChart.const'
import {
  Bar,
  Chart,
  MinersActivityChartItem,
  MinersActivityChartItemLabel,
  MinersActivityChartRoot,
} from './MinersActivityChart.styles'

import { percentage } from '@/app/utils/numberUtils'
import ChartLoadingSkeleton from '@/Components/ChartLoadingSkeleton/ChartLoadingSkeleton'
import { SOCKET_CONTAINER_COLOR } from '@/Components/Container/Socket/Socket.styles'
import { MinersActivityBarsColors } from '@/Theme/GlobalColors'

const MIN_BAR_WIDTH = 3

export interface MinersActivityData {
  total?: number
  [key: string]: number | undefined
}

const getBarSize = (
  data: MinersActivityData,
  barData: number | undefined,
  total: number,
): number => {
  if (!barData) {
    return 0
  }
  const widthInPercents = percentage(barData, data.total || total)

  return widthInPercents < MIN_BAR_WIDTH ? MIN_BAR_WIDTH : widthInPercents
}

const getBar = (data: MinersActivityData, bar: string, barSize: number) => {
  const barValue = data[bar]
  const backgroundColor = SOCKET_CONTAINER_COLOR[bar as keyof typeof SOCKET_CONTAINER_COLOR]
  const color = MinersActivityBarsColors[bar as keyof typeof MinersActivityBarsColors]

  return (
    <Bar key={`bar-${bar}`} $background={backgroundColor} $color={color} $size={barSize}>
      {barSize > MIN_BAR_WIDTH && barValue !== undefined ? formatNumber(barValue) : null}
    </Bar>
  )
}

export interface MinerActivityChartErrorProp {
  data?: { message?: string }
  [key: string]: unknown | null
}

interface MinersActivityChartProps {
  data?: MinersActivityData
  hasMaintenance?: boolean
  large?: boolean
  showBarChart?: boolean
  isLoading?: boolean
  isError?: boolean
  error?: MinerActivityChartErrorProp
  showLabel?: boolean
}

const MinersActivityChart: FC<MinersActivityChartProps> = ({
  data = {},
  hasMaintenance = false,
  large = false,
  showBarChart = false,
  isLoading = false,
  isError = false,
  error = null,
  showLabel = true,
}) => {
  const itemsRoot = showBarChart ? MINERS_ACTIVITY_ITEMS.SHORT : MINERS_ACTIVITY_ITEMS.EXTENDED

  const items = hasMaintenance ? itemsRoot.WITH_MAINTENANCE : itemsRoot.WOUT_MAINTENANCE

  const totalValues = _sum(_compact(_values(data)))

  if (isError) {
    return (
      <Alert
        message="Failed to load miner activity data"
        description={error?.data?.message || 'Please try refreshing the page'}
        type="error"
        showIcon
      />
    )
  }

  if (isLoading || _isEmpty(data)) {
    return (
      <ChartLoadingSkeleton
        minHeight={large ? SKELETON_MIN_HEIGHT_LARGE : SKELETON_MIN_HEIGHT_DEFAULT}
      />
    )
  }

  return (
    <>
      {showBarChart && (
        <Chart>
          {_map(items, (value) => {
            const barValue = data[value]
            const barSize = getBarSize(data, barValue, totalValues)

            if (!barValue) return null

            const barElement = getBar(data, value, barSize)

            const tooltip = MINERS_ACTIVITY_TOOLTIPS[value as keyof typeof MINERS_ACTIVITY_TOOLTIPS]

            if (tooltip) {
              return (
                <Tooltip key={value} title={tooltip} placement="top">
                  {barElement}
                </Tooltip>
              )
            }

            return <span key={value}>{barElement}</span>
          })}
        </Chart>
      )}
      <MinersActivityChartRoot $itemsCount={_size(items)}>
        {_map(items, (value) => {
          const itemNode = (
            <MinersActivityChartItem
              $textColor={MinersActivityBarsColors[value]}
              key={value}
              $large={large}
            >
              {showLabel && (
                <MinersActivityChartItemLabel $large={large}>
                  {MINERS_ACTIVITY_LABELS[value as keyof typeof MINERS_ACTIVITY_LABELS] || value}
                </MinersActivityChartItemLabel>
              )}
              <span>{formatNumber((data[value] as number | undefined) || 0)}</span>
            </MinersActivityChartItem>
          )

          const tooltip = MINERS_ACTIVITY_TOOLTIPS[value as keyof typeof MINERS_ACTIVITY_TOOLTIPS]

          if (tooltip) {
            return (
              <Tooltip title={tooltip} placement="top" key={value}>
                {itemNode}
              </Tooltip>
            )
          }

          return itemNode
        })}
      </MinersActivityChartRoot>
    </>
  )
}

export { MinersActivityChart }
