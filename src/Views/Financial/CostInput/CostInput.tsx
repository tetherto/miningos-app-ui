import Button from 'antd/es/button'
import Select from 'antd/es/select'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  CostInputRoot,
  CostInputTable,
  DatePickerContainer,
  Header,
  HeaderSubtitle,
  PageFooterActions,
  StyledInputNumber,
} from './CostInput.styles'

import { useGetGlobalDataQuery } from '@/app/services/api'
import { usePostProductionDataMutation } from '@/app/services/api/index'
import { Logger } from '@/app/services/logger'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { notifyError, notifySuccess } from '@/app/utils/NotificationService'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ROUTE } from '@/constants/routes'
import { CURRENCY } from '@/constants/units'
import { MONTHS, YEARS } from '@/MultiSiteViews/SharedComponents/Header/helper'
import { ProductionCostResponse } from '@/types'

interface SiteData {
  year: number | null
  energyCost: number | null
  operationalCost: number | null
  month: string
}

interface CostInputColumnParams {
  onInputChange: (params: {
    name: keyof Pick<SiteData, 'energyCost' | 'operationalCost'>
    month: string
    value: number | null
  }) => void
  disableInputs: boolean
}

const numberInputProps = {
  formatter: (value: number | string | undefined) => formatNumber(value ?? 0, undefined, ''),
  prefix: CURRENCY.USD,
  placeholder: 'Cost in USD',
}

const getCostInputColumns = ({ onInputChange, disableInputs }: CostInputColumnParams) => [
  {
    title: 'Month',
    dataIndex: 'month',
  },
  {
    title: 'Monthly Energy Cost',
    className: 'energy-cost',
    dataIndex: 'energyCost',
    render: (value: number | null, record: UnknownRecord) => (
      <StyledInputNumber
        {...numberInputProps}
        name="energyCost"
        value={value ?? undefined}
        disabled={disableInputs}
        onChange={(v: number | string | null) =>
          onInputChange({
            name: 'energyCost',
            month: record.month as string,
            value: _isNumber(v) ? v : null,
          })
        }
      />
    ),
  },
  {
    title: 'Monthly Operational Cost',
    className: 'operational-cost',
    dataIndex: 'operationalCost',
    render: (value: number | null, record: UnknownRecord) => (
      <StyledInputNumber
        {...numberInputProps}
        name="operationalCost"
        value={value ?? undefined}
        disabled={disableInputs}
        onChange={(v: number | string | null) =>
          onInputChange({
            name: 'operationalCost',
            month: record.month as string,
            value: _isNumber(v) ? v : 0,
          })
        }
      />
    ),
  },
  {
    title: 'Monthly Total Cost',
    dataIndex: 'totalCost',
    render: (_: unknown, record: UnknownRecord) => {
      const total = ((record.energyCost as number) ?? 0) + ((record.operationalCost as number) ?? 0)
      return `${CURRENCY.USD} ${formatNumber(total, undefined, CURRENCY.USD)}`
    },
  },
]

const CostInput = () => {
  const [year, setYear] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [productionData, setProductionData] = useState<SiteData[]>([])

  const {
    data: productionCostData,
    isLoading: isLoadingProductionCosts,
    refetch,
  } = useGetGlobalDataQuery<ProductionCostResponse>({
    type: 'productionCosts',
    overwriteCache: true,
  })
  const [saveProductionCost] = usePostProductionDataMutation()

  const yearsOptions = _map(YEARS, (year: number) => ({ label: year, value: year }))

  const fetchProductionData = () => {
    if (!year) return

    const productionCostsForYear = _filter(productionCostData, {
      year,
    })

    setProductionData(
      _map(MONTHS, ({ label, month }) => ({
        month: label,
        energyCost: _find(productionCostsForYear, { month: month + 1 })?.energyCost ?? null,
        operationalCost:
          _find(productionCostsForYear, { month: month + 1 })?.operationalCost ?? null,
        year,
      })),
    )
  }

  useEffect(() => {
    fetchProductionData()
  }, [year, productionCostData])

  const handleCostInputChange = ({
    name,
    month,
    value,
  }: {
    name: keyof Pick<SiteData, 'energyCost' | 'operationalCost'>
    month: string
    value: number | null
  }) => {
    setProductionData((prev: SiteData[]) =>
      _map(prev, (siteData: SiteData) =>
        siteData.month === month ? { ...siteData, [name]: value } : siteData,
      ),
    )
  }

  const handleSave = async () => {
    if (!year) return
    setSaving(true)

    try {
      await Promise.all(
        _map(productionData, ({ energyCost, operationalCost, month, year }) =>
          saveProductionCost({
            data: {
              month: (_find(MONTHS, (m) => m.label === month)?.month ?? -1) + 1,
              year: year,
              energyCost: energyCost ? parseInt(energyCost.toString(), 10) : 0,
              operationalCost: operationalCost ? parseInt(operationalCost.toString(), 10) : 0,
            },
          }),
        ),
      )
      refetch()
      notifySuccess('Cost data saved', '')
    } catch (error) {
      notifyError('Unable to save data', '')
      Logger.error(error as string)
    } finally {
      setSaving(false)
    }
  }

  const isLoading = isLoadingProductionCosts
  const disableForm = saving || isLoadingProductionCosts

  return (
    <CostInputRoot>
      <Header>
        <div>
          <div>Cost Input</div>
          <HeaderSubtitle>
            <Link to={ROUTE.REPORTS_FINANCIAL_COST_SUMMARY}>Cost Summary</Link>
          </HeaderSubtitle>
        </div>
      </Header>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <DatePickerContainer>
            <Select options={yearsOptions} placeholder="Year" value={year} onChange={setYear} />
          </DatePickerContainer>
          <CostInputTable
            columns={getCostInputColumns({
              onInputChange: handleCostInputChange,
              disableInputs: disableForm || false,
            })}
            rowKey="month"
            dataSource={productionData as unknown as UnknownRecord[]}
            pagination={false}
          />
          <PageFooterActions>
            <Button type="primary" loading={saving} onClick={handleSave} disabled={disableForm}>
              Save Costs
            </Button>
          </PageFooterActions>
        </>
      )}
    </CostInputRoot>
  )
}

export default CostInput
