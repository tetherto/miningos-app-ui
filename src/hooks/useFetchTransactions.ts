import _flatMap from 'lodash/flatMap'
import _isEmpty from 'lodash/isEmpty'
import _sumBy from 'lodash/sumBy'
import { useEffect, useState } from 'react'

import { useGetExtDataQuery } from '../app/services/api'
import { getTimeRoundedToMinute } from '../app/utils/dateTimeUtils'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'

interface BuildTransactionsParams {
  year: number
  month: number
  start?: number
  end?: number
  limit?: number
}

const buildTransactionsParams = ({
  year,
  month,
  start,
  end,
  limit,
}: BuildTransactionsParams): UnknownRecord => ({
  type: 'minerpool',
  query: JSON.stringify({ key: 'transactions' }),
  start: start || getTimeRoundedToMinute(new Date(year, month, 1)),
  end: end || getTimeRoundedToMinute(new Date(year, month + 1, 1)),
  ...(limit ? { limit } : {}),
})

interface UseFetchTransactionsParams {
  year: number
  month: number
  start?: number
  end?: number
  limit?: number
}

const useFetchTransactions = ({ year, month, start, end, limit }: UseFetchTransactionsParams) => {
  const [transactionsData, setTransactionsData] = useState<UnknownRecord[]>([])

  const { data: currentTransactions } = useGetExtDataQuery(
    buildTransactionsParams({ year, month, start, end, limit }),
  )

  useEffect(() => {
    if (_isEmpty(currentTransactions)) {
      return
    }
    setTransactionsData(currentTransactions as UnknownRecord[])
  }, [currentTransactions])

  const totBtcProduced = _sumBy(_flatMap(transactionsData, 'transactions'), 'changed_balance')

  return {
    data: transactionsData,
    totBtcProduced,
  }
}

export default useFetchTransactions
