import _endsWith from 'lodash/endsWith'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { AlertsOuterContainer, HistoricalAlertsWrapper } from './Alerts.styles'
import { CurrentAlerts, LocalFilters } from './CurrentAlerts/CurrentAlerts'
import { HistoricalAlerts } from './HistoricalAlerts/HistoricalAlerts'

import { useGetFeaturesQuery } from '@/app/services/api'
import { devicesSlice } from '@/app/slices/devicesSlice'
import { appendIdToTags } from '@/app/utils/deviceUtils'
import { Breadcrumbs } from '@/Components/Breadcrumbs/Breadcrumbs'
import { SEVERITY_KEY } from '@/constants/alerts'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { ROUTE } from '@/constants/routes'
import type { FeatureFlagsData } from '@/types'

const { setFilterTags } = devicesSlice.actions

const Alerts = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const { pathname } = useLocation()
  const dispatch = useDispatch()

  const [params] = useSearchParams()
  const filterKey = params.get(SEVERITY_KEY)

  const [localFilters, setLocalFilters] = useState<LocalFilters>({})

  useEffect(() => {
    if (filterKey) {
      setLocalFilters((prev) => ({
        ...prev,
        [SEVERITY_KEY]: filterKey,
      }))
    }
  }, [filterKey])

  const onAlertClick = (id?: string, uuid?: string) => {
    if (!id) return
    dispatch(setFilterTags(appendIdToTags([id])))
    navigate(`${ROUTE.OPERATIONS_MINING_EXPLORER}?tab=${CROSS_THING_TYPES.MINER}`)
    if (!_endsWith(pathname, `/${uuid}`)) {
      navigate(`${pathname}/${uuid}`, { replace: true })
    }
  }

  const { data: featureFlags } = useGetFeaturesQuery<FeatureFlagsData>(undefined)

  return (
    <AlertsOuterContainer>
      {id ? (
        <Breadcrumbs title={`Alerts - id: ${id}`} destination="/alerts" />
      ) : (
        <Breadcrumbs title="Alerts" destination="/" />
      )}

      <CurrentAlerts
        localFilters={localFilters}
        onLocalFiltersChange={setLocalFilters}
        onAlertClick={onAlertClick}
      />

      {featureFlags?.alertsHistoricalLogEnabled && (
        <HistoricalAlertsWrapper>
          <HistoricalAlerts localFilters={localFilters} onAlertClick={onAlertClick} />
        </HistoricalAlertsWrapper>
      )}
    </AlertsOuterContainer>
  )
}

export default Alerts
