import Button from 'antd/es/button'
import Tabs from 'antd/es/tabs'
import { useState } from 'react'

import { PageTitle } from '../Reports.styles'

import { ENERGY_REPORT_TABS, type EnergyReportTab } from './EnergyReport.constants'
import { DatePickerContainer, EnergyReportRoot, TabContentWrapper } from './EnergyReport.styles'
import EnergyReportMinerView from './EnergyReportMinerView/EnergyReportMinerTypeView'
import { ENERGY_REPORT_MINER_VIEW_SLICES } from './EnergyReportMinerView/EnergyReportMinerView.utils'
import EnergyReportSiteView from './EnergyReportSiteView/EnergyReportSiteView'

import { getLastNDaysEndingYesterday } from '@/app/utils/getTimeRange'
import { useDateRangePicker } from '@/hooks/useDatePicker'

const tabs = [
  {
    key: ENERGY_REPORT_TABS.SITE,
    label: 'Site View',
  },
  {
    key: ENERGY_REPORT_TABS.MINER_TYPE,
    label: 'Miner Type View',
  },
  {
    key: ENERGY_REPORT_TABS.MINER_UNIT,
    label: 'Miner Unit View',
  },
]

const DEFAULT_DATE_RANGE_DAYS = 7

const EnergyReport = () => {
  const [activeTab, setActiveTab] = useState<EnergyReportTab>(ENERGY_REPORT_TABS.SITE)

  const defaultDateRange = getLastNDaysEndingYesterday(DEFAULT_DATE_RANGE_DAYS)

  // Date range picker - default range is last 7 days (excluding today)
  const { dateRange, datePicker, onDateRangeReset } = useDateRangePicker({
    start: defaultDateRange.start,
    end: defaultDateRange.end,
    isResetable: true,
  })

  const renderTabContent = () => {
    switch (activeTab) {
      case ENERGY_REPORT_TABS.SITE:
        return <EnergyReportSiteView dateRange={dateRange} />
      case ENERGY_REPORT_TABS.MINER_TYPE:
        return <EnergyReportMinerView slice={ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE} />
      case ENERGY_REPORT_TABS.MINER_UNIT:
        return <EnergyReportMinerView slice={ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT} />
      default:
        return <EnergyReportSiteView dateRange={dateRange} />
    }
  }

  return (
    <EnergyReportRoot>
      <PageTitle>Energy</PageTitle>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as EnergyReportTab)}
        items={tabs}
        renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} />}
      />
      {activeTab === ENERGY_REPORT_TABS.SITE && (
        <DatePickerContainer>
          {datePicker}
          <Button onClick={onDateRangeReset}>Reset</Button>
        </DatePickerContainer>
      )}
      <TabContentWrapper>{renderTabContent()}</TabContentWrapper>
    </EnergyReportRoot>
  )
}

export default EnergyReport
