import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'
import _map from 'lodash/map'

import PieChart from '../../PieChart/PieChart'

import { PieSectionWrapper, Article, ChartWrapper } from './PieSection.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { Spinner } from '@/Components/Spinner/Spinner'

interface DatasetItem {
  value: number
  color?: string
}

interface PieChartData {
  dataset: Record<string, DatasetItem>
  title: string
}

interface PieSectionProps {
  data?: UnknownRecord
  loading?: boolean
}

const isPieChartData = (item: unknown): item is PieChartData =>
  _isObject(item) &&
  item !== null &&
  'dataset' in item &&
  'title' in item &&
  _isString((item as PieChartData).title)

const PieSection = ({ data = {}, loading }: PieSectionProps) => {
  if (loading) {
    return (
      <PieSectionWrapper>
        <Spinner />
      </PieSectionWrapper>
    )
  }

  return (
    <PieSectionWrapper>
      {_map(data, (item: unknown, index: number) => {
        if (!isPieChartData(item)) {
          return null
        }

        return (
          <Article key={index}>
            <ChartWrapper>
              <PieChart data={item} />
            </ChartWrapper>
          </Article>
        )
      })}
    </PieSectionWrapper>
  )
}

export { PieSection }
