import { Howl, Howler } from 'howler'
import _castArray from 'lodash/castArray'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { useGetListThingsQuery } from '../../../app/services/api'
import { selectFilterTags } from '../../../app/slices/devicesSlice'
import { getIsAlertEnabled } from '../../../app/slices/themeSlice'
import { POLLING_20s } from '../../../constants/pollingIntervalConstants'
import useAlerts from '../../../hooks/useAlerts'
import useDeviceResolution from '../../../hooks/useDeviceResolution'
import { useSmartPolling } from '../../../hooks/useSmartPolling'
import useTimezone from '../../../hooks/useTimezone'
import { getAlertsTableColumns } from '../Alerts.table'
import type { AlertTableRecord } from '../Alerts.table'
import { getAlertsThingsQuery, getCurrentAlerts } from '../Alerts.util'
import { AlertsTableTitle } from '../AlertsTableTitle/AlertsTableTitle'
import TagFilterBar from '../TagFilterBar/TagFilterBar'

import AlertConfirmationModal from './AlertConfirmationModal'

import { isDemoMode } from '@/app/services/api.utils'
import AppTable from '@/Components/AppTable/AppTable'
import { SEVERITY } from '@/constants/alerts'
import { ROUTE } from '@/constants/routes'
import type { Device } from '@/hooks/hooks.types'

const ALARM = {
  PATH: '/audios/beep.mp3',
  VOLUME: 0.5,
  TIMEOUT: 1000,
}

const ALERT_CONFIRMATION_KEY = 'alertsPageAlertConfirmed'

export interface LocalFilters {
  severity?: string[] | string
  status?: string[]
  type?: string[]
  id?: string[]
  thing?: { id?: string }
  [key: string]: unknown
}

interface CurrentAlertsProps {
  localFilters: LocalFilters
  onLocalFiltersChange: (filters: LocalFilters) => void
  onAlertClick?: (id?: string, uuid?: string) => void
}

export const CurrentAlerts = ({
  localFilters,
  onAlertClick,
  onLocalFiltersChange,
}: CurrentAlertsProps) => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const { id } = useParams<{ id?: string }>()
  const { isMobile } = useDeviceResolution()
  const { getFormattedDate } = useTimezone()
  const navigate = useNavigate()

  const filterTags = useSelector(selectFilterTags) as string[]

  const [confirmed, setConfirmed] = useState(
    () => sessionStorage.getItem(ALERT_CONFIRMATION_KEY) === 'true',
  )
  const isAlertEnabled = useSelector(getIsAlertEnabled)
  const { isLoading: alertsLoading, data: alertsData } = useAlerts()
  const hasCriticalAlerts = !alertsLoading && !_isEmpty(_head(alertsData as unknown[]))

  // Only play sound when severity filter is "critical" or no severity filter is set
  const isCriticalFilter =
    _isEmpty(localFilters.severity) || _castArray(localFilters.severity).includes(SEVERITY.CRITICAL)

  const isAlertPlaying = !isDemoMode && isAlertEnabled && hasCriticalAlerts && isCriticalFilter
  const alarm = useRef<Howl | null>(null)

  useEffect(() => {
    if (confirmed && !alarm.current) {
      alarm.current = new Howl({
        src: [ALARM.PATH],
        loop: true,
        volume: ALARM.VOLUME,
      })
    }

    return () => {
      if (alarm.current) {
        alarm.current.stop()
        alarm.current.unload()
        alarm.current = null
      }
    }
  }, [confirmed])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    let unlockHandler: (() => void) | null = null
    const shouldPlay = confirmed && isAlertPlaying

    if (shouldPlay && alarm.current) {
      const tryPlay = () => {
        // Resume AudioContext if browser suspended it (autoplay policy)
        if (Howler.ctx?.state === 'suspended') {
          Howler.ctx.resume()
        }
        if (alarm.current && !alarm.current.playing()) {
          alarm.current.play()
        }
      }

      timeoutId = setTimeout(tryPlay, ALARM.TIMEOUT)

      // Fallback: on user gesture, resume AudioContext so queued sound starts
      unlockHandler = () => {
        if (Howler.ctx?.state === 'suspended') {
          Howler.ctx.resume()
        }
      }
      document.addEventListener('click', unlockHandler)
      document.addEventListener('touchstart', unlockHandler)
    } else if (alarm.current?.playing()) {
      alarm.current.pause()
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (unlockHandler) {
        document.removeEventListener('click', unlockHandler)
        document.removeEventListener('touchstart', unlockHandler)
      }
    }
  }, [isAlertPlaying, confirmed])

  const { data: alertsThingsData, isLoading } = useGetListThingsQuery(
    {
      limit: 250,
      query: getAlertsThingsQuery(id, filterTags, false),
      status: 1,
      fields: JSON.stringify({
        'last.snap.stats.status': 1,
        'last.alerts': 1,
        'last.snap.config.firmware_ver': 1,
        'opts.address': 1,
        info: 1,
        type: 1,
        tags: 1,
        id: 1,
      }),
    },
    {
      pollingInterval: smartPolling20s,
    },
  )

  const alerts = getCurrentAlerts(alertsThingsData as Device[][], {
    filterTags,
    localFilters,
    onAlertClick,
    id,
  })

  const onSearchChange = (value: string[]) => {
    if (_isEmpty(value)) {
      navigate(ROUTE.ALERTS)
    }
  }

  return (
    <div>
      <AlertConfirmationModal
        isOpen={!confirmed}
        onOk={() => {
          setConfirmed(true)
          sessionStorage.setItem(ALERT_CONFIRMATION_KEY, 'true')
        }}
      />
      <AppTable<AlertTableRecord>
        rowKey={(record) => record.uuid}
        title={() => (
          <AlertsTableTitle
            title="Current Alerts"
            subtitle={
              <TagFilterBar
                onSearchChange={onSearchChange}
                localFilters={localFilters}
                setLocalFilters={onLocalFiltersChange}
                placeholder="Search / filter devices"
              />
            }
          />
        )}
        pagination={{ showSizeChanger: true }}
        dataSource={alerts}
        columns={getAlertsTableColumns(isMobile, getFormattedDate)}
        loading={isLoading}
      />
    </div>
  )
}
