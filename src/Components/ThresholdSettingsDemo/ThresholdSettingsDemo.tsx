import Col from 'antd/es/col'
import _map from 'lodash/map'
import _some from 'lodash/some'
import type { FC } from 'react'

import {
  ThresholdSettingsDemoTitle,
  ThresholdSettingsDemoContent,
} from './ThresholdSettingsDemo.styles'

import { getContainerParamsSettingList } from '@/app/utils/containerUtils'
import SingleStatCard from '@/Components/Explorer/DetailsView/SingleStatCard/SingleStatCard'
import { useBeepSound } from '@/hooks/useBeep'

interface ContainerParamsSetting {
  label: string
  description?: string
  highlightColor?: string
  isFlashing?: boolean
  isSuperflashing?: boolean
  [key: string]: unknown
}

interface ThresholdSettingsDemoProps {
  title: string
  minValueByCharacterMap: Record<string, number>
  unit?: string
  onGetHighlightColor?: (value: number) => string
  onGetIsFlashing?: (value: number) => boolean
  onGetIsSuperflashing?: (value: number) => boolean
}

export const ThresholdSettingsDemo: FC<ThresholdSettingsDemoProps> = ({
  title,
  minValueByCharacterMap,
  unit,
  onGetHighlightColor,
  onGetIsFlashing,
  onGetIsSuperflashing,
}) => {
  const items = getContainerParamsSettingList(minValueByCharacterMap, {
    unit,
    getHighlightColor: onGetHighlightColor,
    getIsFlashing: onGetIsFlashing,
    getIsSuperflashing: onGetIsSuperflashing,
  })

  const isAnyItemSuperflashing = _some(items, { isSuperflashing: true })

  useBeepSound({
    isAllowed: isAnyItemSuperflashing,
    delayMs: 500,
  })

  return (
    <>
      <ThresholdSettingsDemoTitle>{title}</ThresholdSettingsDemoTitle>
      <ThresholdSettingsDemoContent gutter={[30, 20]}>
        {_map(items, (item: ContainerParamsSetting) => (
          <Col key={item.label} span={8}>
            <SingleStatCard
              variant="secondary"
              row
              color={item.highlightColor}
              flash={item.isFlashing}
              superflash={item.isSuperflashing}
              name={item.label}
              value={item.description}
            />
          </Col>
        ))}
      </ThresholdSettingsDemoContent>
    </>
  )
}
