import Col from 'antd/es/col'
import Input from 'antd/es/input'
import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'
import type React from 'react'
import { useEffect, useState } from 'react'

import {
  ContainerParamsSettingsInputTitle,
  ContainerParamsSettingsSection,
  ContainerParamsSettingsTitle,
} from './ContainerParamsSettings.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getContainerParametersSettings } from '@/Components/Explorer/Containers/SettingsForm/SettingsFormUtils'

interface ParamItem {
  name: string
  value: number | string | undefined
  suffix: string
  type: string
}

interface ContainerParamsSettingsProps {
  title?: string
  data?: UnknownRecord
}

export const ContainerParamsSettings = ({
  title = 'Parameters',
  data = {},
}: ContainerParamsSettingsProps) => {
  const [params, setParams] = useState<Record<string, ParamItem> | undefined>(
    getContainerParametersSettings(data) as Record<string, ParamItem> | undefined,
  )

  const getParamChangeHandler = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev: Record<string, ParamItem> | undefined) => {
      if (!prev || !prev[key]) return prev
      return {
        ...prev,
        [key]: {
          ...prev[key],
          value: +event?.target?.value,
        },
      }
    })
  }

  useEffect(() => {
    setParams(getContainerParametersSettings(data) as Record<string, ParamItem> | undefined)
  }, [data])

  if (!params) {
    return null
  }

  return (
    <>
      <ContainerParamsSettingsTitle>{title}</ContainerParamsSettingsTitle>
      <ContainerParamsSettingsSection gutter={[30, 20]}>
        {_map(_toPairs(params), ([key, item]) => (
          <Col span={8} key={key}>
            <ContainerParamsSettingsInputTitle>{item?.name}</ContainerParamsSettingsInputTitle>
            <Input
              key={key}
              type={item?.type}
              suffix={item?.suffix}
              disabled
              value={+(item?.value ?? 0) || 0}
              onChange={getParamChangeHandler(key)}
            />
          </Col>
        ))}
      </ContainerParamsSettingsSection>
    </>
  )
}
