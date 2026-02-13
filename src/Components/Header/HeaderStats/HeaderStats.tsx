import _isNumber from 'lodash/isNumber'
import { useState, useEffect } from 'react'

import { getHashrateUnit } from '../../../app/utils/deviceUtils'
import { decimalToMegaNumber } from '../../../app/utils/numberUtils'
import type { ValueUnit } from '../../../app/utils/utils.types'
import { DEFAULT_HEADER_PREFERENCES } from '../../../Components/Settings/HeaderControls/types'
import { UNITS } from '../../../constants/units'
import { useHeaderStats } from '../../../hooks/useHeaderStats'
import HeaderConsumptionBox from '../../Farms/FarmCard/StatBox/Header/HeaderConsumptionBox'
import HeaderEfficiencyBox from '../../Farms/FarmCard/StatBox/Header/HeaderEfficiencyBox'
import HeaderHashrateBox from '../../Farms/FarmCard/StatBox/Header/HeaderHashrateBox'
import HeaderMinersBox from '../../Farms/FarmCard/StatBox/Header/HeaderMinersBox'

import { HeaderRightBorder } from './HeaderRightBorder'
import { getEfficiencyStat } from './HeaderStats.helper'
import { WebappHeaderStatsContainer } from './HeaderStats.styles'

import {
  HEADER_PREFERENCES_EVENTS,
  type HeaderPreferences,
} from '@/Components/Settings/HeaderControls/types'

const STORAGE_KEY = 'headerControlsPreferences'

// Load preferences from localStorage
const loadPreferencesFromStorage = (): HeaderPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as HeaderPreferences
    }
  } catch {
    // Failed to load header preferences from localStorage
  }
  return DEFAULT_HEADER_PREFERENCES
}

const HeaderStats = () => {
  const {
    minerEntry,
    isLoading,
    consumption,
    isDevicesDataLoading,
    poolMinersOn,
    poolMinersTotal,
    poolHashrate,
    minersAmount,
  } = useHeaderStats()

  const { totalContainerCapacity, offlineOrSleep, majorErrors, onlineOrMinorErrors } =
    minersAmount || {}

  // Load preferences from localStorage
  const [preferences, setPreferences] = useState<HeaderPreferences>(loadPreferencesFromStorage)

  // Listen for storage changes (when settings are updated in another component)
  useEffect(() => {
    const handleStorageChange = () => {
      setPreferences(loadPreferencesFromStorage())
    }

    window.addEventListener(HEADER_PREFERENCES_EVENTS.STORAGE, handleStorageChange)

    // Also listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      setPreferences(loadPreferencesFromStorage())
    }
    window.addEventListener(
      HEADER_PREFERENCES_EVENTS.PREFERENCES_CHANGED,
      handleCustomStorageChange,
    )

    return () => {
      window.removeEventListener(HEADER_PREFERENCES_EVENTS.STORAGE, handleStorageChange)
      window.removeEventListener(
        HEADER_PREFERENCES_EVENTS.PREFERENCES_CHANGED,
        handleCustomStorageChange,
      )
    }
  }, [])

  const hashrateValue = _isNumber(minerEntry?.hashrate_mhs_1m_sum_aggr)
    ? minerEntry.hashrate_mhs_1m_sum_aggr
    : 0
  const poolHashrateValue = _isNumber(poolHashrate) ? decimalToMegaNumber(poolHashrate) : 0

  return (
    <WebappHeaderStatsContainer>
      <HeaderRightBorder />

      {(preferences.mosMiners || preferences.poolMiners) && (
        <>
          <HeaderMinersBox
            on={_isNumber(onlineOrMinorErrors) ? onlineOrMinorErrors : 0}
            error={_isNumber(majorErrors) ? majorErrors : 0}
            off={_isNumber(offlineOrSleep) ? offlineOrSleep : 0}
            total={
              _isNumber(totalContainerCapacity)
                ? totalContainerCapacity
                : 0
            }
            poolOn={_isNumber(poolMinersOn) ? poolMinersOn : 0}
            poolTotal={_isNumber(poolMinersTotal) ? poolMinersTotal : 0}
            showMos={preferences.mosMiners}
            showPool={preferences.poolMiners}
            isLoading={isLoading}
          />
          <HeaderRightBorder />
        </>
      )}

      {(preferences.mosHashrate || preferences.poolHashrate) && (
        <>
          <HeaderHashrateBox
            hashrate={
              getHashrateUnit(_isNumber(hashrateValue) ? hashrateValue : 0, 3) as {
                unit: 'TH/s'
                value: number
              }
            }
            poolHashrate={getHashrateUnit(poolHashrateValue, 3) as { unit: 'TH/s'; value: number }}
            showMos={preferences.mosHashrate}
            showPool={preferences.poolHashrate}
            isLoading={isLoading}
          />
          <HeaderRightBorder />
        </>
      )}

      {preferences.consumption && (
        <>
          <HeaderConsumptionBox
            error={!consumption?.formattedConsumption || consumption?.consumptionAlert}
            consumption={
              consumption?.formattedConsumption
                ? {
                    value: (consumption.formattedConsumption as ValueUnit).value as
                      | number
                      | undefined,
                    unit: (consumption.formattedConsumption as ValueUnit).unit,
                    realValue: (consumption.formattedConsumption as ValueUnit).realValue,
                  }
                : undefined
            }
            isLoading={isDevicesDataLoading}
          />
          <HeaderRightBorder />
        </>
      )}

      {preferences.efficiency && (
        <>
          <HeaderEfficiencyBox
            efficiency={{
              value: getEfficiencyStat(
                _isNumber(consumption?.rawConsumptionW) ? consumption.rawConsumptionW : undefined,
                _isNumber(minerEntry?.hashrate_mhs_1m_sum_aggr)
                  ? minerEntry.hashrate_mhs_1m_sum_aggr
                  : undefined,
              ),
              unit: UNITS.EFFICIENCY_W_PER_TH_S,
            }}
            isLoading={isLoading || isDevicesDataLoading}
          />
          <HeaderRightBorder />
        </>
      )}
    </WebappHeaderStatsContainer>
  )
}

export default HeaderStats
