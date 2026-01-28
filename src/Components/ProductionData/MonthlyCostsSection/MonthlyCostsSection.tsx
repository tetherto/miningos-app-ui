import Button from 'antd/es/button'
import DatePicker from 'antd/es/date-picker'
import { endOfMonth } from 'date-fns/endOfMonth'
import dayjs from 'dayjs'
import _cloneDeepI from 'lodash/cloneDeep'
import _find from 'lodash/find'
import { useEffect, useState } from 'react'

import { usePostProductionDataMutation } from '../../../app/services/api'
import { useGetGlobalDataQuery } from '../../../app/services/api'
import { ProductionDataIcon } from '../../Icons/ProductionDataIcon'

import ContentMonthlyCosts from './ContentMonthlyCosts/ContentMonthlyCosts'
import {
  Container,
  PickerWrapper,
  TopActionWrapper,
  NoDataWrapper,
} from './MonthlyCostsSection.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface EnergyCostsUSD {
  consumedEnergy: number
  nonConsumedAvailableEnergy: number
  nonAvailableConsumedEnergy: number
  excessDemandedPower: number
  tolls: number
  reactiveEnergy: number
}

interface OperationalCostsUSD {
  grossHRCost: number
  securityCost: number
  maintenanceCost: number
  hSServicesCost: number
  otherCosts: number
}

interface CostsData {
  energyCostsUSD: EnergyCostsUSD
  operationalCostsUSD: OperationalCostsUSD
}

interface MonthlyCostsSectionProps {
  site?: string
}

const MonthlyCostsSection = ({ site = '' }: MonthlyCostsSectionProps) => {
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs | null>(dayjs(new Date()))
  const [isAddingData, setIsAddingData] = useState<boolean>(false)
  const [selectedData, setSelectedData] = useState<CostsData | null>(null)

  const { data, refetch } = useGetGlobalDataQuery({ type: 'productionCosts' })

  const [updateProductionData, { isLoading: isSavingData }] = usePostProductionDataMutation()

  const updateData = async (payload: { data: UnknownRecord }) => {
    const data = await updateProductionData(payload)
    if (data) {
      setIsAddingData(false)
      refetch().then(({ data: updatedData }) => {
        const year = selectedMonth?.year()
        const month = (selectedMonth?.month() || 0) + 1
        setSelectedData(
          (_find(updatedData as CostsData[] | undefined, { site, year, month }) as CostsData) ||
            null,
        )
      })
    }
  }

  const disableFutureDates = (current: dayjs.Dayjs | null): boolean =>
    current ? current > dayjs(endOfMonth(new Date())) : false

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setIsAddingData(false)
    setSelectedMonth(date)
  }

  useEffect(() => {
    if (!selectedMonth) return
    const year = selectedMonth.year()
    const month = selectedMonth.month() + 1
    setSelectedData(
      (_find(data as CostsData[] | undefined, { site, year, month }) as CostsData) || null,
    )
  }, [data, selectedMonth, site])

  return (
    <Container>
      <TopActionWrapper>
        <PickerWrapper>
          <DatePicker
            onChange={handleDateChange}
            defaultValue={selectedMonth}
            picker="month"
            format="MMMM YYYY"
            disabledDate={disableFutureDates}
          />
        </PickerWrapper>
        {site && !isAddingData && (
          <Button onClick={() => setIsAddingData(true)} disabled={!selectedMonth}>
            {selectedData ? 'Edit' : 'Add'} Costs Data
          </Button>
        )}
      </TopActionWrapper>
      {isAddingData && selectedMonth && (
        <ContentMonthlyCosts
          isEditing={isAddingData}
          cancelEdit={() => setIsAddingData(false)}
          onSubmit={updateData}
          isSaving={isSavingData}
          site={site}
          year={selectedMonth.year()}
          month={selectedMonth.month()}
          data={_cloneDeepI(selectedData) as CostsData}
        />
      )}
      {selectedMonth && !isAddingData && (
        <>
          {selectedData ? (
            <ContentMonthlyCosts
              data={_cloneDeepI(selectedData) as CostsData}
              year={selectedMonth.year()}
              month={selectedMonth.month()}
            />
          ) : (
            <NoDataWrapper>
              <ProductionDataIcon />
              <span>No Data.</span>
              <span>Please Add Costs Data in Site Page.</span>
            </NoDataWrapper>
          )}
        </>
      )}
    </Container>
  )
}

export default MonthlyCostsSection
