import Col from 'antd/es/col'
import Input from 'antd/es/input'
import Row from 'antd/es/row'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import { useEffect, useState, FC } from 'react'

import { SettingsFormInputTitle, SettingsFormSection } from './SettingsForm.styles'
import { getContainerParametersSettings } from './SettingsFormUtils'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface SettingsFormProps {
  data?: UnknownRecord
}

interface ParameterItem {
  value?: string
  name?: string
  id?: string
  suffix?: string
  type?: string
  [key: string]: unknown
}

const SettingsForm: FC<SettingsFormProps> = ({ data }) => {
  const [parametersList, setParametersList] = useState<Record<string, ParameterItem>>({})

  const handleSetupParams = () => {
    if (data) {
      const settings = getContainerParametersSettings(data)
      if (settings) {
        setParametersList(settings as Record<string, ParameterItem>)
      }
    }
  }

  useEffect(() => {
    handleSetupParams()
  }, [])

  return (
    <Row>
      <Col span={24}>
        <SettingsFormSection gutter={[30, 20]}>
          {_map(_keys(parametersList), (parameter: string, index: number) => {
            const param = parametersList[parameter]
            return (
              <Col key={index} span={8}>
                <SettingsFormInputTitle>{param?.name}</SettingsFormInputTitle>
                <Input
                  disabled
                  key={param?.id as string | undefined}
                  value={param?.value}
                  suffix={param?.suffix as string | undefined}
                  type={param?.type as string | undefined}
                />
              </Col>
            )
          })}
        </SettingsFormSection>
      </Col>
      <Col span={4}></Col>
    </Row>
  )
}

export default SettingsForm
