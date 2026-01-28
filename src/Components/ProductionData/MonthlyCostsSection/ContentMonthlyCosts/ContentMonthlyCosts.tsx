import { PlusOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import _capitalize from 'lodash/capitalize'
import _get from 'lodash/get'
import _noop from 'lodash/noop'
import _set from 'lodash/set'
import _sum from 'lodash/sum'
import _values from 'lodash/values'
import { useState } from 'react'

import { Row, BottomActionWrapper, EqualSign, Title } from '../MonthlyCostsSection.styles'
import TotalsArticle from '../TotalsArticle/TotalsArticle'

import BoxedItem from './BoxedItem'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

type EnergyCosts = {
  consumedEnergy: number
  nonConsumedAvailableEnergy: number
  nonAvailableConsumedEnergy: number
  excessDemandedPower: number
  tolls: number
  reactiveEnergy: number
}

type OperationalCosts = {
  grossHRCost: number
  securityCost: number
  maintenanceCost: number
  hSServicesCost: number
  otherCosts: number
}

export type CostsData = {
  energyCostsUSD: EnergyCosts
  operationalCostsUSD: OperationalCosts
}

interface ContentMonthlyCostsProps {
  isEditing?: boolean
  isSaving?: boolean
  cancelEdit?: () => void
  onSubmit?: (payload: { data: UnknownRecord }) => void
  site?: string
  year: number
  month: number
  data?: CostsData
}

const ContentMonthlyCosts = ({
  isEditing = false,
  cancelEdit = _noop,
  onSubmit = _noop,
  site = '',
  year,
  month,
  data = {
    energyCostsUSD: {
      consumedEnergy: 0,
      nonConsumedAvailableEnergy: 0,
      nonAvailableConsumedEnergy: 0,
      excessDemandedPower: 0,
      tolls: 0,
      reactiveEnergy: 0,
    },
    operationalCostsUSD: {
      grossHRCost: 0,
      securityCost: 0,
      maintenanceCost: 0,
      hSServicesCost: 0,
      otherCosts: 0,
    },
  },
}: ContentMonthlyCostsProps) => {
  const [currentCostsData, setCurrentCostsData] = useState<CostsData>(data)

  const energyCostsSum = _sum(_values(currentCostsData.energyCostsUSD))
  const operationalCostsSum = _sum(_values(currentCostsData.operationalCostsUSD))

  const handleSaveClick = () => {
    const payload = {
      year,
      month: month + 1,
      site: _capitalize(site),
      ...currentCostsData.energyCostsUSD,
      ...currentCostsData.operationalCostsUSD,
    }
    onSubmit({ data: payload })
  }

  const getBoxedItemValueArgs = (attribute: string) => ({
    isEditing,
    value: _get(currentCostsData, attribute),
    onChange: (value: number | null) => {
      const newData = { ...currentCostsData }

      _set(newData, attribute, value)

      setCurrentCostsData(newData)
    },
  })

  return (
    <>
      {!isEditing && (
        <TotalsArticle
          energyCosts={energyCostsSum}
          operationalCosts={operationalCostsSum}
          year={year}
          month={month}
        />
      )}

      <Title $noColor>Energy Costs</Title>
      <Row $centered>
        <BoxedItem
          description="Consumed Energy"
          {...getBoxedItemValueArgs('energyCostsUSD.consumedEnergy')}
        />
        <PlusOutlined />
        <BoxedItem
          description="Non Consumed Available Energy"
          {...getBoxedItemValueArgs('energyCostsUSD.nonConsumedAvailableEnergy')}
        />
        <PlusOutlined />
        <BoxedItem
          description="Non Available Consumed Energy"
          {...getBoxedItemValueArgs('energyCostsUSD.nonAvailableConsumedEnergy')}
        />
        <PlusOutlined />
        <BoxedItem
          description="Excess Demanded Power"
          {...getBoxedItemValueArgs('energyCostsUSD.excessDemandedPower')}
        />
        <PlusOutlined />
        <BoxedItem description="Tolls" {...getBoxedItemValueArgs('energyCostsUSD.tolls')} />
        <PlusOutlined />
        <BoxedItem
          description="Reactive Energy"
          {...getBoxedItemValueArgs('energyCostsUSD.reactiveEnergy')}
        />
        <EqualSign />
        <BoxedItem
          value={_sum(_values(currentCostsData.energyCostsUSD))}
          description="Total Energy Costs"
        />
      </Row>

      <Title $noColor>Operational Costs</Title>
      <Row $centered>
        <BoxedItem
          description="Gross HR Cost (Balance)"
          {...getBoxedItemValueArgs('operationalCostsUSD.grossHRCost')}
        />
        <PlusOutlined />
        <BoxedItem
          description="Security Costs"
          {...getBoxedItemValueArgs('operationalCostsUSD.securityCost')}
        />
        <PlusOutlined />
        <BoxedItem
          description="Maintainance Costs"
          {...getBoxedItemValueArgs('operationalCostsUSD.maintenanceCost')}
        />
        <PlusOutlined />
        <BoxedItem
          description="H&S Services Costs"
          {...getBoxedItemValueArgs('operationalCostsUSD.hSServicesCost')}
        />
        <PlusOutlined />
        <BoxedItem
          description="Other Costs"
          {...getBoxedItemValueArgs('operationalCostsUSD.otherCosts')}
        />
        <EqualSign />
        <BoxedItem
          value={_sum(_values(currentCostsData.operationalCostsUSD))}
          description="Total Operational Costs"
        />
      </Row>

      {isEditing && (
        <BottomActionWrapper>
          <Button onClick={cancelEdit}>cancel</Button>
          <Button onClick={handleSaveClick}>Save</Button>
        </BottomActionWrapper>
      )}
    </>
  )
}

export default ContentMonthlyCosts
