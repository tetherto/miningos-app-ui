import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _noop from 'lodash/noop'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { getBackUrl as getBackUrlParam } from '../../app/utils/domainUtils'

import {
  CommentButtonWrapper,
  ContainerHeader,
  ContainerName,
  ContainerRoot,
  ContainerStyledButton,
  ContainerTabsWrapper,
  StyledAntdTabs,
} from './Container.styles'

import { devicesSlice } from '@/app/slices/devicesSlice'
import { getSupportedTabs } from '@/app/utils/containerTabsHelper'
import { getContainerName } from '@/app/utils/containerUtils'
import { appendContainerToTag, isMiner } from '@/app/utils/deviceUtils'
import { getContainerMinersByContainerTagsQuery } from '@/app/utils/queryUtils'
import { CommentsPopover } from '@/Components/CommentsPopover/CommentsPopover'
import type { DevicePayload } from '@/Components/Explorer/List/ListView.types'
import { POLLING_20s } from '@/constants/pollingIntervalConstants'
import { ROUTE } from '@/constants/routes'
import { useFetchListThingsPaginatedData } from '@/hooks/useFetchListThingsPaginatedData'
import { useSmartPolling } from '@/hooks/useSmartPolling'

interface ContainerData extends DevicePayload {
  info?: {
    container?: string
  }
  type: string
  [key: string]: unknown
}

export type OnSubHeadingClickParams = {
  tab?: string
  containerInfo?: Record<string, unknown>
}

interface ContainerProps {
  data: ContainerData
  refetch?: VoidFunction
  showComments?: boolean
  basePath?: string
  subHeading?: string
  onSubHeadingClick: (params: OnSubHeadingClickParams) => void
  homeTabKey?: string
}

const { setResetSelections, selectContainer, setFilterTags } = devicesSlice.actions

const Container = ({
  data,
  refetch = _noop,
  showComments = true,
  basePath = `${ROUTE.OPERATIONS_MINING_EXPLORER}/containers`,
  subHeading = 'View miners of container',
  onSubHeadingClick,
  homeTabKey = 'home',
}: ContainerProps) => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [currentActiveTab, setCurrentActiveTab] = useState<string | undefined>(undefined)
  const { tab } = useParams<{ tab?: string }>()
  const paramBackUrl = getBackUrlParam()
  const { info, type } = data
  const HOME_TAB_KEY = homeTabKey

  const { thingsData: containerMinersResponse, isLoading: isConnectedMinersLoading } =
    useFetchListThingsPaginatedData({
      query: getContainerMinersByContainerTagsQuery([`container-${info?.container}`]),
      fields: JSON.stringify({
        id: 1,
        type: 1,
        code: 1,
        info: 1,
        address: 1,
        rack: 1,
        'last.snap.stats.status': 1,
        'last.snap.stats.are_all_errors_minor': 1,
        'last.snap.config.power_mode': 1,
        'last.snap.stats.hashrate': 1,
        'last.snap.stats.hashrate_mhs': 1,
        'last.snap.stats.temperature_c': 1,
        'last.snap.stats.frequency_mhz': 1,
        'last.snap.stats.power_w': 1,
        'last.snap.stats.miner_specific.power_pct': 1,
        'last.snap.stats.uptime_ms': 1,
        'last.snap.config.led_status': 1,
        'last.snap.config.firmware_ver': 1,
        'last.snap.config.pool_config': 1,
        'last.alerts': 1,
      }),
      pollingIntervalMs: smartPolling20s,
    })

  const tabs = (() =>
    getSupportedTabs(type, {
      ...data,
      connectedMiners: _filter(containerMinersResponse, (device) => isMiner(device.type as string)),
      isConnectedMinersLoading,
    }))()

  const onChange = (key: string) => {
    navigate(
      `${basePath}/${appendContainerToTag(info?.container ?? '')}/${key}${paramBackUrl ? `?backUrl=${paramBackUrl}` : ''}`,
    )
  }

  // Note: React Compiler automatically memoizes onChange, so this won't cause infinite loops
  useEffect(() => {
    const validTab = _find(tabs, (availableTab) => availableTab.key === tab)
    if (validTab) {
      setCurrentActiveTab(tab)
    } else if (tab !== HOME_TAB_KEY) {
      onChange(HOME_TAB_KEY)
    }
  }, [tab, tabs, onChange])

  useEffect(() => {
    dispatch(setResetSelections())
    dispatch(selectContainer(data))
  }, [])

  const handleClick = () => {
    dispatch(setFilterTags([]))
    onSubHeadingClick({
      tab,
      containerInfo: info,
    })
  }

  return (
    <ContainerRoot>
      <ContainerHeader>
        <ContainerName>{getContainerName(info?.container, type)}</ContainerName>
        <ContainerStyledButton onClick={handleClick}>{subHeading}</ContainerStyledButton>
      </ContainerHeader>
      <ContainerTabsWrapper>
        {showComments && (
          <CommentButtonWrapper>
            <CommentsPopover device={data} onAddCommentSuccess={refetch} />
          </CommentButtonWrapper>
        )}
        <StyledAntdTabs
          size="small"
          type="card"
          items={tabs}
          destroyOnHidden
          onChange={onChange}
          activeKey={currentActiveTab}
          defaultActiveKey={HOME_TAB_KEY}
        />
      </ContainerTabsWrapper>
    </ContainerRoot>
  )
}

export { Container }
