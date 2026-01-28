import Col from 'antd/es/col'
import Input from 'antd/es/input'
import Radio from 'antd/es/radio'
import type { RadioChangeEvent } from 'antd/es/radio'
import Row from 'antd/es/row'
import { useEffect, useState } from 'react'

import { CardTitle } from '../../../../../Card/Card.styles'
import { InputTitle } from '../BitdeerSettings.styles'
import { getBitdeerTacticsData } from '../BitdeerSettings.utils'

import { BitdeerTacticsContainer } from './BitdeerTactics.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { CONTAINER_TACTICS_TYPE } from '@/constants/containerConstants'

type TacticsType =
  | typeof CONTAINER_TACTICS_TYPE.DISABLED
  | typeof CONTAINER_TACTICS_TYPE.ELECTRICITY
  | typeof CONTAINER_TACTICS_TYPE.COIN

interface TacticsData {
  start_policy?: {
    type?: TacticsType
    electricity?: {
      start_price?: string | number
      current_price?: string | number
    }
    coin?: {
      start_price?: string | number
      current_price?: string | number
    }
  }
  stop_policy?: {
    type?: TacticsType
    electricity?: {
      stop_price?: string | number
      current_price?: string | number
    }
    coin?: {
      stop_price?: string | number
      current_price?: string | number
    }
  }
}

interface BitdeerTacticsProps {
  data?: UnknownRecord
}

const BitdeerTactics = ({ data = {} }: BitdeerTacticsProps) => {
  const [autoStopTacticsRadio, setAutoStopTacticsRadio] = useState<TacticsType>(
    CONTAINER_TACTICS_TYPE.DISABLED,
  )

  const [autoStartTacticsRadio, setAutoStartTacticsRadio] = useState<TacticsType>(
    CONTAINER_TACTICS_TYPE.DISABLED,
  )
  const [tacticsData, setTacticsData] = useState<TacticsData>({})

  const onAutoStopRadioChange = (e: RadioChangeEvent) => {
    setAutoStopTacticsRadio(e.target.value as TacticsType)
  }

  const onAutoStartRadioChange = (e: RadioChangeEvent) => {
    setAutoStartTacticsRadio(e.target.value as TacticsType)
  }

  useEffect(() => {
    const tactics = getBitdeerTacticsData(data) as TacticsData | undefined
    if (tactics) {
      setAutoStartTacticsRadio(
        (tactics.start_policy?.type as TacticsType) || CONTAINER_TACTICS_TYPE.DISABLED,
      )
      setAutoStopTacticsRadio(
        (tactics.stop_policy?.type as TacticsType) || CONTAINER_TACTICS_TYPE.DISABLED,
      )
      setTacticsData(tactics)
    }
  }, [data])

  return (
    <BitdeerTacticsContainer>
      <Row gutter={[20, 20]}>
        <Col span={12}>
          <CardTitle>Auto Stop Tactics</CardTitle>
          <Radio.Group onChange={onAutoStopRadioChange} value={autoStopTacticsRadio} disabled>
            <Row>
              <Col span={24}>
                <Radio value={CONTAINER_TACTICS_TYPE.DISABLED}>
                  <InputTitle>Not Use</InputTitle>
                </Radio>
              </Col>
            </Row>
            <Row gutter={[20, 20]}>
              <Col span={8}>
                <Radio value={CONTAINER_TACTICS_TYPE.ELECTRICITY}>
                  <InputTitle>Electricity Price</InputTitle>
                </Radio>
              </Col>
              <Col span={8}>
                <InputTitle>Stop Price</InputTitle>
                <Input
                  disabled
                  value={
                    tacticsData?.stop_policy?.electricity?.stop_price as string | number | undefined
                  }
                />
              </Col>
              <Col span={8}>
                <InputTitle>Current Price</InputTitle>
                <Input
                  disabled
                  value={
                    tacticsData?.stop_policy?.electricity?.current_price as
                      | string
                      | number
                      | undefined
                  }
                />
              </Col>
            </Row>
            <Row gutter={[20, 20]}>
              <Col span={8}>
                <Radio value={CONTAINER_TACTICS_TYPE.COIN}>
                  <InputTitle>Coin Price</InputTitle>
                </Radio>
              </Col>
              <Col span={8}>
                <InputTitle>Stop Price</InputTitle>
                <Input
                  disabled
                  value={tacticsData?.stop_policy?.coin?.stop_price as string | number | undefined}
                />
              </Col>
              <Col span={8}>
                <InputTitle>Current Price</InputTitle>
                <Input
                  disabled
                  value={
                    tacticsData?.stop_policy?.coin?.current_price as string | number | undefined
                  }
                />
              </Col>
            </Row>
          </Radio.Group>
        </Col>
        <Col span={12}>
          <CardTitle>Auto Run Tactics</CardTitle>
          <Radio.Group onChange={onAutoStartRadioChange} value={autoStartTacticsRadio} disabled>
            <Row>
              <Col span={24}>
                <Radio value={CONTAINER_TACTICS_TYPE.DISABLED}>
                  <InputTitle>Not Use</InputTitle>
                </Radio>
              </Col>
            </Row>
            <Row gutter={[20, 20]}>
              <Col span={8}>
                <Radio value={CONTAINER_TACTICS_TYPE.ELECTRICITY}>
                  <InputTitle>Electricity Price</InputTitle>
                </Radio>
              </Col>
              <Col span={8}>
                <InputTitle>Run Price</InputTitle>
                <Input disabled value={tacticsData?.start_policy?.electricity?.start_price} />
              </Col>
              <Col span={8}>
                <InputTitle>Current Price</InputTitle>
                <Input disabled value={tacticsData?.start_policy?.electricity?.current_price} />
              </Col>
            </Row>
            <Row gutter={[20, 20]}>
              <Col span={8}>
                <Radio value={CONTAINER_TACTICS_TYPE.COIN}>
                  <InputTitle>Coin Price</InputTitle>
                </Radio>
              </Col>
              <Col span={8}>
                <InputTitle>Run Price</InputTitle>
                <Input disabled value={tacticsData?.start_policy?.coin?.start_price} />
              </Col>
              <Col span={8}>
                <InputTitle>Current Price</InputTitle>
                <Input disabled value={tacticsData?.start_policy?.coin?.current_price} />
              </Col>
            </Row>
          </Radio.Group>
        </Col>
      </Row>
    </BitdeerTacticsContainer>
  )
}

export default BitdeerTactics
