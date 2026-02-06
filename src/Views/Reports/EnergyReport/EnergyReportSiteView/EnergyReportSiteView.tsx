import { ReloadOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Tooltip from 'antd/es/tooltip'
import _head from 'lodash/head'
import _isFinite from 'lodash/isFinite'
import _map from 'lodash/map'
import { useMemo } from 'react'

import { ColouredMetric } from '../../Reports.styles'
import { MINER_MODES } from '../EnergyReport.constants'
import { useEnergyReportSiteView } from '../hooks/useEnergyReportSiteView'

import {
  ColumnHeader,
  EnergyReportSiteViewContainer,
  MinerRowHeader,
  MinerRowHeaderSubTitle,
  MinerRowHeaderTitle,
  MiningUnitCard,
  MiningUnitCardHeader,
  MiningUnitCards,
  MiningUnitCardSubTitle,
  MiningUnitCardTitle,
  PowerChartSection,
  RefreshButtonWrapper,
  ReportSection,
  SectionHeader,
  SectionHeaderWithButton,
  StyledTooltip,
  TooltipTriggerSpan,
} from './EnergyReportSiteView.styles'

import { formatNumber } from '@/app/utils/format'
import AppTable from '@/Components/AppTable/AppTable'
import { MinersActivityChart } from '@/Components/Explorer/DetailsView/MinersActivityChart/MinersActivityChart'
import SiteOperationsChart from '@/Components/SiteOperationChart/SiteOperationChart'
import { Spinner } from '@/Components/Spinner/Spinner'
import { CHART_COLORS, COLOR } from '@/constants/colors'
import { UNITS } from '@/constants/units'
import { getContainerMinersChartData } from '@/Views/ContainerWidgets/ContainerWidget.util'
import { formatPowerConsumption } from '@/Views/Reports/OperationsDashboard/utils'

const TOOLTIP_TITLE =
  'This count represents unique miners of this type. Status columns may sum to more than this total because: Power modes (Normal/High/Low/Sleep) are mutually exclusive, but Maintenance and Error can overlap with any power mode. For example, a miner can be in Normal power mode while also flagged for Maintenance, so it appears in both columns.'

const getTooltipPopupContainer = (trigger: HTMLElement) => trigger.parentElement || document.body

interface DateRange {
  start: number
  end: number
}

interface EnergyReportSiteViewProps {
  dateRange: DateRange
}

const EnergyReportSiteView = ({ dateRange }: EnergyReportSiteViewProps) => {
  const {
    powerConsumptionData,
    powerModeData,
    containers,
    tailLogData,
    isLoading,
    refetchSnapshotData,
  } = useEnergyReportSiteView(dateRange)

  const powerModeTableColumns = useMemo(
    () => [
      {
        title: 'Miner Type',
        dataIndex: 'minerType',
        key: 'minerType',
        render: (text: string, record: { count: number; power: string }) => (
          <MinerRowHeader>
            <MinerRowHeaderTitle>{text}</MinerRowHeaderTitle>
            <MinerRowHeaderSubTitle>
              <StyledTooltip title={TOOLTIP_TITLE} getPopupContainer={getTooltipPopupContainer}>
                <TooltipTriggerSpan>
                  {formatNumber(record.count, {}, '0')} miners
                </TooltipTriggerSpan>
              </StyledTooltip>
              <span>•</span>
              <span>{record.power}</span>
            </MinerRowHeaderSubTitle>
          </MinerRowHeader>
        ),
      },
      ..._map(MINER_MODES, ({ mode, title, color }) => ({
        title: () => <ColumnHeader>{title}</ColumnHeader>,
        dataIndex: mode,
        key: mode,
        width: 120,
        render: (text: number) => (
          <ColouredMetric $textColor={color ?? COLOR.GREY_IDLE}>{text ?? 0}</ColouredMetric>
        ),
      })),
    ],
    [],
  )

  return (
    <EnergyReportSiteViewContainer>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <PowerChartSection>
            <SectionHeader>Power Consumption</SectionHeader>
            <SiteOperationsChart
              title=""
              data={powerConsumptionData.data}
              propName="consumption"
              unit={UNITS.ENERGY_MW}
              nominalValue={powerConsumptionData.nominalValue ?? undefined}
              isLoading={powerConsumptionData.isLoading}
              legendPosition="left"
              legend={[
                { color: CHART_COLORS.METALLIC_BLUE, label: 'Power Consumption' },
                ...(_isFinite(powerConsumptionData.nominalValue)
                  ? [{ color: CHART_COLORS.red, label: 'Power Available' }]
                  : []),
              ]}
              yTicksFormatter={(value) => formatPowerConsumption(value)}
            />
          </PowerChartSection>
          <ReportSection>
            <SectionHeaderWithButton>
              <SectionHeader>Power Mode by Miner Type</SectionHeader>
              <RefreshButtonWrapper>
                <Tooltip title="Get latest snapshot" placement="bottomRight">
                  <Button
                    size="middle"
                    icon={<ReloadOutlined />}
                    onClick={refetchSnapshotData}
                    loading={isLoading}
                  >
                    Update data
                  </Button>
                </Tooltip>
              </RefreshButtonWrapper>
            </SectionHeaderWithButton>
            <AppTable
              columns={powerModeTableColumns}
              pagination={false}
              dataSource={powerModeData}
              rowKey="minerType"
            />
          </ReportSection>
          <ReportSection>
            <SectionHeader>Mining Unit Power Summary</SectionHeader>
            <MiningUnitCards>
              {_map(containers, (container, i) => (
                <MiningUnitCard key={i}>
                  <MiningUnitCardHeader>
                    <MiningUnitCardTitle>{container.info?.container}</MiningUnitCardTitle>
                    <MiningUnitCardSubTitle>
                      {formatNumber(container.minersCount, {}, '0')} Miners
                    </MiningUnitCardSubTitle>
                  </MiningUnitCardHeader>
                  <MinersActivityChart
                    showLabel={false}
                    data={getContainerMinersChartData(
                      container.info?.container ?? '',
                      _head(tailLogData) ?? {},
                      container.info?.nominalMinerCapacity ?? 0,
                    )}
                  />
                </MiningUnitCard>
              ))}
            </MiningUnitCards>
          </ReportSection>
        </>
      )}
    </EnergyReportSiteViewContainer>
  )
}

export default EnergyReportSiteView
