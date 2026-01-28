import _isArray from 'lodash/isArray'
import _map from 'lodash/map'
import { FC } from 'react'

import { minersDistributionColumns } from './Dashboard.constants'
import { useDashboardData } from './Dashboard.hooks'
import {
  DoughnutChartCardWrapper,
  InventoryDashboardContentRoot,
  TableSectionContent,
  TableTitle,
  TableWrapper,
} from './Dashboard.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import Accordion from '@/Components/Accordion/Accordion'
import AppTable from '@/Components/AppTable/AppTable'
import DoughnutChartCard from '@/Components/DoughnutChartCard/DoughnutChartCard'
import { Spinner } from '@/Components/Spinner/Spinner'

const Dashboard: FC = () => {
  const { isLoading, inventoryClassification, minerDistribution, isMinersDataLoading } =
    useDashboardData()

  if (isLoading) {
    return <Spinner />
  }

  return (
    <InventoryDashboardContentRoot>
      <Accordion title="Current Site" unpadded isOpened solidBackground>
        <DoughnutChartCardWrapper>
          {_map(inventoryClassification, (card: UnknownRecord) => (
            <DoughnutChartCard
              data={card}
              useBracketsForPct
              isLoading={isLoading}
              key={card.label as string}
            />
          ))}
        </DoughnutChartCardWrapper>
      </Accordion>
      <Accordion title="Miner Distribution" unpadded isOpened solidBackground>
        <TableSectionContent>
          <TableWrapper>
            <TableTitle>Current Site</TableTitle>
            <AppTable
              dataSource={
                _isArray(minerDistribution)
                  ? (minerDistribution as unknown as readonly UnknownRecord[])
                  : []
              }
              columns={minersDistributionColumns}
              loading={isMinersDataLoading}
              pagination={{
                showSizeChanger: true,
              }}
            />
          </TableWrapper>
        </TableSectionContent>
      </Accordion>
    </InventoryDashboardContentRoot>
  )
}

export { Dashboard }
