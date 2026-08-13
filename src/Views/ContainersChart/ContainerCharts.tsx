import Empty from 'antd/es/empty'
import Select from 'antd/es/select'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _head from 'lodash/head'
import _map from 'lodash/map'
import _replace from 'lodash/replace'
import _startsWith from 'lodash/startsWith'
import _uniq from 'lodash/uniq'
import { useState } from 'react'

import {
  isAntspaceHydro,
  isAntspaceImmersion,
  isBitdeer,
  isMicroBT,
} from '../../app/utils/containerUtils'
import { Breadcrumbs } from '../../Components/Breadcrumbs/Breadcrumbs'
import LineChartCard from '../../Components/LineChartCard/LineChartCard'
import { Spinner } from '../../Components/Spinner/Spinner'

import { TAGS_LABEL } from './ContainerCharts.constants'
import { getOverviewChartOilAdapter } from './ContainerCharts.oil.adapter'
import { getOverviewChartPressureAdapter } from './ContainerCharts.pressure.adapter'
import {
  ChartTypeWrapper,
  OverviewChartLayout,
  SelectWrapper,
  ViewWrapper,
} from './ContainerCharts.styles'
import { getOverviewChartTempAdapter } from './ContainerCharts.temp.adapter'

import { useGetFeatureConfigQuery, useGetListThingsQuery } from '@/app/services/api'

interface CombinationOption {
  value: string
  label: string
}

interface Thing {
  tags?: string[]
}

const ContainerCharts = () => {
  const { data: featureConfig } = useGetFeatureConfigQuery(undefined)
  const [selectedCombination, setSelectedCombination] = useState<string | null>(null)

  const { data: listThingData, isLoading: isLoadingCombinations } = useGetListThingsQuery({
    query: JSON.stringify({
      tags: {
        $in: ['t-container'],
      },
    }),
    status: 1,
    sort: JSON.stringify({ 'info.container': 1 }),
    fields: JSON.stringify({ tags: 1 }),
  })

  // Check if container charts feature is enabled
  if (featureConfig && !featureConfig.containerCharts) {
    return <Empty description="Container Charts feature is not enabled" />
  }

  const combinations: CombinationOption[] = (() => {
    if (isLoadingCombinations || !listThingData) {
      return []
    }

    const tagPrefix = 'container_miner-'
    const tagsData = _head(listThingData as unknown[]) as Thing[] | undefined
    if (!tagsData) return []

    const tags = _uniq(
      _map(tagsData, (item) =>
        _replace(_find(item.tags, (tag) => _startsWith(tag, tagPrefix)) ?? '', tagPrefix, ''),
      ),
    )

    const mappedCombinations = _filter(
      _map(tags, (tag) => ({
        value: tag,
        label: TAGS_LABEL[tag as keyof typeof TAGS_LABEL],
      })),
      ({ label }) => !!label,
    )

    return mappedCombinations
  })()

  const handleSelectCombinationChange = (value: string) => {
    setSelectedCombination(value)
  }

  return (
    <ViewWrapper>
      <Breadcrumbs title="Container Charts" destination="/" />

      {isLoadingCombinations || !listThingData ? (
        <Spinner />
      ) : (
        <SelectWrapper>
          <div>Select Combination:</div>
          <Select
            value={selectedCombination ?? undefined}
            style={{ width: 350 }}
            onChange={handleSelectCombinationChange}
            options={combinations}
          />
        </SelectWrapper>
      )}

      {selectedCombination && (
        <OverviewChartLayout key={selectedCombination}>
          {isBitdeer(selectedCombination) && (
            <ChartTypeWrapper>
              <div className="title">Liquid Temp H</div>
              <LineChartCard
                type="container"
                tag={`container_miner-${selectedCombination}`}
                statKey="20s"
                dataAdapter={getOverviewChartTempAdapter('hot')}
                queryLimit={90}
              />
            </ChartTypeWrapper>
          )}

          <ChartTypeWrapper>
            <div className="title">Liquid Temp L</div>
            <LineChartCard
              type="container"
              tag={`container_miner-${selectedCombination}`}
              statKey="20s"
              dataAdapter={getOverviewChartTempAdapter('cold')}
              queryLimit={90}
            />
          </ChartTypeWrapper>

          {!isMicroBT(selectedCombination) && !isAntspaceHydro(selectedCombination) && (
            <ChartTypeWrapper>
              <div className="title">Oil Temp</div>
              <LineChartCard
                type="container"
                tag={`container_miner-${selectedCombination}`}
                statKey="20s"
                dataAdapter={getOverviewChartOilAdapter}
                queryLimit={90}
              />
            </ChartTypeWrapper>
          )}

          {!isAntspaceImmersion(_replace(selectedCombination, '_', '-')) && (
            <ChartTypeWrapper>
              <div className="title">Pressure</div>
              <LineChartCard
                type="container"
                tag={`container_miner-${selectedCombination}`}
                statKey="20s"
                dataAdapter={getOverviewChartPressureAdapter}
                queryLimit={90}
              />
            </ChartTypeWrapper>
          )}
        </OverviewChartLayout>
      )}
    </ViewWrapper>
  )
}

export default ContainerCharts
