import Alert from 'antd/es/alert'
import Empty from 'antd/es/empty'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _values from 'lodash/values'

import { useGetListThingsQuery } from '../../app/services/api'
import { getByTagsQuery } from '../../app/utils/queryUtils'
import { formatCabinets } from '../../Components/Explorer/List/ListView.util'
import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../constants/permissions.constants'
import { POLLING_5s } from '../../constants/pollingIntervalConstants'
import { useSmartPolling } from '../../hooks/useSmartPolling'

import LVCabinetWidgetCard from './LVCabinetWidgetCard'
import type { LVCabinet } from './LVCabinetWidgets.types'
import { getErrorMessage } from './LVCabinetWidgets.util'

import { Title } from '@/Components/Shared'
import { Spinner } from '@/Components/Spinner/Spinner'
import { LV_CABINET_DEVICES_TAG } from '@/constants/deviceConstants'
import {
  Centered,
  LvCabinetsRoot,
  LvCabinetsWrapper,
  Section,
} from '@/Views/LVCabinetWidgets/LVCabinetWidgets.styles'

const LVCabinetWidgets = () => {
  const smartPolling5s = useSmartPolling(POLLING_5s)
  const {
    data: cabinetDevices,
    isLoading,
    isFetching,
    error,
  } = useGetListThingsQuery(
    {
      query: getByTagsQuery(_values(LV_CABINET_DEVICES_TAG)),
      status: 1,
      limit: 1000,
      sort: JSON.stringify({ 'info.pos': 1 }),
    },
    { pollingInterval: smartPolling5s },
  )
  const lvCabinets = formatCabinets(_head(cabinetDevices as unknown[]) || [])
  const isBusy = isLoading || isFetching
  const hasData = !_isEmpty(lvCabinets)
  const cabinetsReadPermission = `${AUTH_PERMISSIONS.CABINETS}:${AUTH_LEVELS.READ}`
  const errorMessage = getErrorMessage(error)

  return (
    <LvCabinetsRoot>
      <GateKeeper config={{ perm: cabinetsReadPermission }}>
        <>
          <Title>LV Cabinets</Title>
          {isBusy ? (
            <Centered>
              <Spinner />
            </Centered>
          ) : (
            <>
              {errorMessage && (
                <Section>
                  <Alert message="Error" description={errorMessage} type="error" showIcon />
                </Section>
              )}
              {!errorMessage && !hasData && (
                <Centered>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No cabinets available" />
                </Centered>
              )}
              {!errorMessage && hasData && (
                <LvCabinetsWrapper>
                  {_map(lvCabinets, (lvCabinet: LVCabinet) => (
                    <LVCabinetWidgetCard lvCabinet={lvCabinet} key={lvCabinet?.id} />
                  ))}
                </LvCabinetsWrapper>
              )}
            </>
          )}
        </>
      </GateKeeper>
    </LvCabinetsRoot>
  )
}

export default LVCabinetWidgets
