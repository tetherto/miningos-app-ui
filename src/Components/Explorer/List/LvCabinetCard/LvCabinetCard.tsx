import Col from 'antd/es/col'
import Tooltip from 'antd/es/tooltip'
import _find from 'lodash/find'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _keys from 'lodash/keys'
import { useDispatch, useSelector } from 'react-redux'

import RightNavigateToIcon from '../../../Icons/RightNavigateToIcon'
import IconRow from '../IconRow/IconRow'
import { DeviceCardColText } from '../ListView.styles'
import { TemperatureIndicator } from '../MinerCard/Icons/TemperatureIndicator'
import { MinerCol } from '../MinerCard/MinerCol'

import { BorderedLink, LvCabinetCardContainer, StyledRow } from './LvCabinetCard.styles'

import { devicesSlice, selectSelectedLVCabinets } from '@/app/slices/devicesSlice'
import {
  getCabinetTitle,
  getLvCabinetTempSensorColor,
  getRootTempSensorTempValue,
  unitToKilo,
} from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatValueUnit } from '@/app/utils/format'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { ROUTE } from '@/constants/routes'
import { UNITS } from '@/constants/units'

const { setResetSelections, removeSelectedLVCabinet, selectLVCabinet } = devicesSlice.actions

interface LvCabinetCardProps {
  device: UnknownRecord
}

const LvCabinetCard = ({ device }: LvCabinetCardProps) => {
  const dispatch = useDispatch()
  const selectedLvCabinets = useSelector(selectSelectedLVCabinets)
  const isSelected = _find(_keys(selectedLvCabinets), (key: string) => device.id === key)

  const onCabinetCardClick = () => {
    dispatch(setResetSelections())
    dispatch(
      isSelected
        ? removeSelectedLVCabinet(
            device as unknown as import('@/app/utils/deviceUtils/types').Device,
          )
        : selectLVCabinet(device as unknown as import('@/app/utils/deviceUtils/types').Device),
    )
  }

  const temperatureValue = getRootTempSensorTempValue(
    device as unknown as import('@/app/utils/deviceUtils/types').Device,
  ) as number | undefined
  const lvCabinetTitle = getCabinetTitle(
    device as unknown as import('@/app/utils/deviceUtils/types').Device,
  )
  const powerMeters =
    (device?.powerMeters as Array<{
      last?: { snap?: { stats?: { power_w?: number | string } } }
    }>) || []
  const powerMode = _head(powerMeters)

  return (
    <LvCabinetCardContainer $isHighlighted={false} onClick={onCabinetCardClick}>
      <StyledRow>
        <Col span={1}></Col>
        <MinerCol
          sm={8}
          xs={8}
          lg={8}
          md={8}
          dataRow1={<DeviceCardColText>{lvCabinetTitle}</DeviceCardColText>}
          dataRow2={null}
        />
        <Col span={10}>
          <IconRow
            icon={<TemperatureIndicator />}
            text={
              <Tooltip title="Temperature">
                <DeviceCardColText
                  color={getLvCabinetTempSensorColor((temperatureValue as number) ?? 0)}
                >
                  {!_isNil(temperatureValue)
                    ? `${temperatureValue} ${UNITS.TEMPERATURE_C}`
                    : '-'}{' '}
                </DeviceCardColText>
              </Tooltip>
            }
          />
        </Col>
        <Col>
          {_isNumber(powerMode?.last?.snap?.stats?.power_w)
            ? formatValueUnit(unitToKilo(powerMode.last.snap.stats.power_w), UNITS.POWER_KW)
            : '-'}
        </Col>
      </StyledRow>

      <Col span={2}>
        <BorderedLink
          to={`/cabinets/${device?.id}?backUrl=${ROUTE.OPERATIONS_MINING_EXPLORER}?tab=${CROSS_THING_TYPES.CABINET}`}
        >
          <RightNavigateToIcon />
        </BorderedLink>
      </Col>
    </LvCabinetCardContainer>
  )
}

export default LvCabinetCard
