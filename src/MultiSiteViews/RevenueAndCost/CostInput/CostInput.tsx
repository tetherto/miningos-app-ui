import Button from 'antd/es/button'
import Select from 'antd/es/select'
import { eachMonthOfInterval } from 'date-fns/eachMonthOfInterval'
import { format } from 'date-fns/format'
import { getMonth } from 'date-fns/getMonth'
import { getYear } from 'date-fns/getYear'
import _find from 'lodash/find'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import _reverse from 'lodash/reverse'
import _toUpper from 'lodash/toUpper'
import { useEffect, useState } from 'react'

import { PageFooterActions, PageRoot } from '../../Common.style'
import { Header } from '../../SharedComponents/Header/Header'

import { CostInputTable, HeaderControls, StyledInputNumber } from './CostInput.style'

import { useLazyGetProductionCostsQuery, useSetProductionCostsMutation } from '@/app/services/api'
import { Logger } from '@/app/services/logger'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { notifyError, notifySuccess } from '@/app/utils/NotificationService'
import { Spinner } from '@/Components/Spinner/Spinner'
import { CURRENCY } from '@/constants/units'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

interface SiteData {
  siteId: string
  siteName: string
  energyCostsUSD: number | null
  operationalCostsUSD: number | null
}

interface CostInputColumnParams {
  onInputChange: (params: {
    name: keyof Pick<SiteData, 'energyCostsUSD' | 'operationalCostsUSD'>
    siteId: string
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
    title: 'Site Name',
    dataIndex: 'siteName',
  },
  {
    title: 'Monthly Energy Cost',
    className: 'energy-cost',
    dataIndex: 'energyCostsUSD',
    render: (value: number | null, record: UnknownRecord) => (
      <StyledInputNumber
        {...numberInputProps}
        name="energyCostsUSD"
        value={value ?? undefined}
        disabled={disableInputs}
        onChange={(v: number | string | null) =>
          onInputChange({
            name: 'energyCostsUSD',
            siteId: record.siteId as string,
            value: _isNumber(v) ? v : null,
          })
        }
      />
    ),
  },
  {
    title: 'Monthly Operational Cost',
    className: 'operational-cost',
    dataIndex: 'operationalCostsUSD',
    render: (value: number | null, record: UnknownRecord) => (
      <StyledInputNumber
        {...numberInputProps}
        name="operationalCostsUSD"
        value={value ?? undefined}
        disabled={disableInputs}
        onChange={(v: number | string | null) =>
          onInputChange({
            name: 'operationalCostsUSD',
            siteId: record.siteId as string,
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
      const total =
        ((record.energyCostsUSD as number) ?? 0) + ((record.operationalCostsUSD as number) ?? 0)
      return `${CURRENCY.USD} ${formatNumber(total, undefined, CURRENCY.USD)}`
    },
  },
]

const CostInput = () => {
  const [month, setMonth] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [sitesProductionData, setSitesProductionData] = useState<SiteData[]>([])

  const { siteList, isLoading: isSiteListLoading } = useMultiSiteMode()
  const [getProductionCost, { isLoading: isLoadingProductionCosts }] =
    useLazyGetProductionCostsQuery()
  const [saveProductionCost] = useSetProductionCostsMutation()

  // Generate month dropdown options
  const monthOptions = _reverse(
    _map(
      eachMonthOfInterval({
        start: new Date('2025-01-01'),
        end: new Date(),
      }),
      (date: Date) => ({ label: format(date, 'MMMM yyyy'), value: date.valueOf() }),
    ),
  )

  const fetchProductionData = async () => {
    if (!month) return

    const data: SiteData[] = await Promise.all(
      _map(siteList, async ({ id, name }) => {
        const { data: costData } = await getProductionCost({
          region: _toUpper(id),
          overwriteCache: true,
        })

        const monthCostData = Array.isArray(costData)
          ? _find(costData, { month: getMonth(month) + 1, year: getYear(month) })
          : undefined
        const { energyCostsUSD = null, operationalCostsUSD = null } = monthCostData ?? {}

        return {
          siteId: id,
          siteName: name,
          energyCostsUSD,
          operationalCostsUSD,
        }
      }),
    )

    setSitesProductionData(data)
  }

  useEffect(() => {
    fetchProductionData()
  }, [month])

  const handleCostInputChange = ({
    name,
    siteId,
    value,
  }: {
    name: keyof Pick<SiteData, 'energyCostsUSD' | 'operationalCostsUSD'>
    siteId: string
    value: number | null
  }) => {
    setSitesProductionData((prev: SiteData[]) =>
      _map(prev, (siteData: SiteData) =>
        siteData.siteId === siteId ? { ...siteData, [name]: value } : siteData,
      ),
    )
  }

  const handleSave = async () => {
    if (!month) return
    setSaving(true)

    try {
      await Promise.all(
        _map(sitesProductionData, async ({ siteId, energyCostsUSD, operationalCostsUSD }) =>
          saveProductionCost({
            region: _toUpper(siteId),
            month: getMonth(month) + 1,
            year: getYear(month),
            energyCostsUSD: energyCostsUSD ? parseInt(energyCostsUSD.toString()) : 0,
            operationalCostsUSD: operationalCostsUSD ? parseInt(operationalCostsUSD.toString()) : 0,
          }),
        ),
      )
      notifySuccess('Cost data saved', '')
    } catch (error) {
      notifyError('Unable to save data', '')
      Logger.error(error as string)
    } finally {
      setSaving(false)
    }
  }

  const isLoading = isSiteListLoading
  const disableForm = saving || isLoadingProductionCosts

  return (
    <PageRoot>
      <Header
        hasBackButton
        showSiteName={false}
        backToDestination="dashboard"
        pageTitle="Cost Input"
        onTableDateRangeChange={() => {}}
      />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <HeaderControls>
            <Select options={monthOptions} placeholder="Month" value={month} onChange={setMonth} />
          </HeaderControls>
          <CostInputTable
            columns={getCostInputColumns({
              onInputChange: handleCostInputChange,
              disableInputs: disableForm,
            })}
            rowKey="siteId"
            dataSource={sitesProductionData as unknown as UnknownRecord[]}
            pagination={false}
          />
          <PageFooterActions>
            <Button type="primary" loading={saving} onClick={handleSave} disabled={disableForm}>
              Save Costs
            </Button>
          </PageFooterActions>
        </>
      )}
    </PageRoot>
  )
}

export default CostInput
