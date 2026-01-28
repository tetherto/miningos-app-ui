import Empty from 'antd/es/empty'
import _head from 'lodash/head'
import { useNavigate } from 'react-router-dom'

import { AntspaceStats, BitdeerStats, CommonStats, MicroBTStats } from './components'
import {
  BoxRow,
  HomeTabContainer,
  HomeTabStatDataWrapper,
  LeftColumn,
  PrimaryContainerDataWrapper,
  RightColumn,
} from './HomeTab.styles'
import { MinerData } from './MinerData'

import {
  isAntspaceHydro,
  isAntspaceImmersion,
  isBitdeer,
  isMicroBT,
} from '@/app/utils/containerUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ContainerControlsBox } from '@/Components/Container/ContentBox/ContainerControlsBox'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'
import {
  MinerActivityChartErrorProp,
  MinersActivityChart,
} from '@/Components/Explorer/DetailsView/MinersActivityChart/MinersActivityChart'
import StatsGroupCard from '@/Components/Explorer/DetailsView/StatsGroupCard/StatsGroupCard'
import { useContainerSettings } from '@/hooks/useContainerSettings'
import { useHomeTabMinerData } from '@/hooks/useHomeTabMinerData'
import useTimezone from '@/hooks/useTimezone'
import { EmptyStateContainer } from '@/styles/shared-styles'
import {
  getContainerMinersChartData,
  MinerTailLogItem,
} from '@/Views/ContainerWidgets/ContainerWidget.util'

interface HomeTabProps {
  data?: Device & {
    connectedMiners?: Device[]
    isConnectedMinersLoading?: boolean
  }
}

const HomeTab = ({ data }: HomeTabProps) => {
  const navigate = useNavigate()
  const { getFormattedDate } = useTimezone()
  const { containerSettings } = useContainerSettings(data)
  const {
    minerTailLogItem,
    alarmsDataItems,
    totalSockets,
    getPowerBoxData,
    isLoading: isMinerTailLogLoading,
    isError: isMinerTailLogError,
    error: minerTailLogError,
  } = useHomeTabMinerData({
    data,
    getFormattedDate,
    navigate,
  })

  // No data state - centered on screen
  if (!data) {
    return (
      <EmptyStateContainer>
        <Empty description="No data" />
      </EmptyStateContainer>
    )
  }

  return (
    <HomeTabContainer>
      <LeftColumn>
        <PrimaryContainerDataWrapper>
          <ContainerPanel $noWrap>
            <ContentBox
              title={`Miner stats: ${data.connectedMiners?.length} Sockets Online
                / ${totalSockets} sockets`}
            >
              <StatsGroupCard miners={data.connectedMiners} />
              <MinersActivityChart
                large
                isLoading={isMinerTailLogLoading}
                isError={isMinerTailLogError}
                error={minerTailLogError as MinerActivityChartErrorProp}
                data={getContainerMinersChartData(
                  data.info?.container as string,
                  (_head(minerTailLogItem as unknown as unknown[]) as MinerTailLogItem) ??
                    ({} as MinerTailLogItem),
                  data?.info?.nominalMinerCapacity as number,
                )}
              />
            </ContentBox>
          </ContainerPanel>
          <MinerData data={data} />
        </PrimaryContainerDataWrapper>
        <HomeTabStatDataWrapper>
          {isBitdeer(data?.type) && <BitdeerStats data={data} />}

          {isMicroBT(data?.type) && (
            <MicroBTStats
              data={data}
              containerSettings={(containerSettings as UnknownRecord) ?? undefined}
            />
          )}

          {(isAntspaceHydro(data?.type) || isAntspaceImmersion(data?.type)) && (
            <AntspaceStats
              data={data}
              containerSettings={(containerSettings as UnknownRecord) ?? undefined}
            />
          )}

          <CommonStats
            data={data}
            containerSettings={(containerSettings as UnknownRecord) ?? undefined}
            alarmsDataItems={alarmsDataItems}
            getPowerBoxData={getPowerBoxData}
          />
        </HomeTabStatDataWrapper>
      </LeftColumn>
      <RightColumn>
        <BoxRow>
          <ContentBox title="Container Controls">
            <ContainerControlsBox data={data} />
          </ContentBox>
        </BoxRow>
      </RightColumn>
    </HomeTabContainer>
  )
}

export { HomeTab }
