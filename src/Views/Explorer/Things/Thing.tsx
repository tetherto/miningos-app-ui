import Alert from 'antd/es/alert'
import Button from 'antd/es/button'
import Empty from 'antd/es/empty'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'

import { SetPowerModeValues } from '../Explorer.constants'
import { ErrorBannerWrapper } from '../Explorer.styles'

import { useGetListThingsQuery } from '@/app/services/api'
import { actionsSlice } from '@/app/slices/actionsSlice'
import { appendIdToTag, isContainer, isContainerTag } from '@/app/utils/deviceUtils'
import { getByIdsQuery, getContainerByContainerTagsQuery } from '@/app/utils/queryUtils'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ACTION_TYPES } from '@/constants/actions'
import { POLLING_20s } from '@/constants/pollingIntervalConstants'
import { useSmartPolling } from '@/hooks/useSmartPolling'
import { Device } from '@/types'
import { Container } from '@/Views/Container/Container'
import NotFoundPage from '@/Views/NotFoundPage/NotFoundPage'

const { setAddPendingSubmissionAction } = actionsSlice.actions

const FLOW_OPTIONS = ['edit']

const Thing = () => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const { id, flow } = useParams()
  const dispatch = useDispatch()
  const listThingsQuery = useGetListThingsQuery(
    {
      query:
        id && isContainerTag(id)
          ? getContainerByContainerTagsQuery([id as string])
          : getByIdsQuery([id as string]),
      status: 1,
    },
    {
      pollingInterval: smartPolling20s,
      skip: !id,
    },
  )

  const data = (listThingsQuery.data as Device[][] | undefined) ?? []
  const { isLoading, isError, refetch } = listThingsQuery

  if (isLoading) return <Spinner />

  if (flow && !_includes(FLOW_OPTIONS, flow)) {
    return <NotFoundPage />
  }

  const item = (_head(_head(data)) as Device) ?? null

  if (!item) {
    return <Empty />
  }

  const rebootMiner = () => {
    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.REBOOT,
        tags: [appendIdToTag(item.id as string)],
        params: [],
      }),
    )
  }

  const setPowerMode = (powerMode: string) => {
    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SET_POWER_MODE,
        tags: [appendIdToTag(item.id as string)],
        params: [powerMode],
      }),
    )
  }

  const setLed = (isOn: boolean) => {
    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SET_LED,
        tags: [appendIdToTag(item.id as string)],
        params: [isOn],
      }),
    )
  }

  const minerModel = (item?.tags as unknown[] | undefined)?.[3] as string | undefined
  const setPowerModeValues = SetPowerModeValues[minerModel as keyof typeof SetPowerModeValues]

  return (
    <>
      {isError && (
        <ErrorBannerWrapper>
          <Alert
            message="Error retrieving latest data. Any data shown may not be the latest. Please refresh the page to get the latest data"
            type="error"
          />
        </ErrorBannerWrapper>
      )}
      {isContainer(item?.type as string | undefined) ? (
        <Container
          refetch={refetch}
          data={item as unknown as Parameters<typeof Container>[0]['data']}
        />
      ) : (
        <>
          <h1>Device</h1>
          <h3>Tags</h3>
          <ul>
            {_map(item.tags as unknown[], (tag) => (
              <li key={tag as string}>{tag as string} </li>
            ))}
          </ul>
          <h4>Control</h4>
          <Button onClick={rebootMiner}>Reboot</Button>
          <h4>Set power mode</h4>
          {_map(setPowerModeValues, (powerModeValue) => (
            <Button key={powerModeValue} onClick={() => setPowerMode(powerModeValue)}>
              {powerModeValue}
            </Button>
          ))}
          <h4>Set LED</h4>
          <Button
            onClick={() => {
              setLed(true)
            }}
          >
            On
          </Button>{' '}
          <Button
            onClick={() => {
              setLed(false)
            }}
          >
            Off
          </Button>
          <br />
          <br />
          <br />
          {JSON.stringify(data)}
        </>
      )}
    </>
  )
}

export default Thing
