import _isString from 'lodash/isString'
import _noop from 'lodash/noop'
import _toUpper from 'lodash/toUpper'
import { FC, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import { getSelectedSites } from '@/app/slices/multiSiteSlice'
import { getBeginningOfMonth, getEndOfYesterday, getRangeTimestamps } from '@/app/utils/dateUtils'
import { Breadcrumbs } from '@/Components/Breadcrumbs/Breadcrumbs'
import MosSelect, { MosSelectOption } from '@/Components/MosSelect/MosSelect'
import { Spinner } from '@/Components/Spinner/Spinner'
import { PERIOD } from '@/constants/ranges'
import { useAverageBtcPrice } from '@/hooks/useAverageBtcPrice'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import useTimezone from '@/hooks/useTimezone'
import {
  DurationButtonsWrapper,
  ExtendedWrapper,
  HeaderWithBreadcrumbs,
  HeaderWrapper,
  Subheader,
} from '@/MultiSiteViews/Common.style'
import { BtcAveragePrice } from '@/MultiSiteViews/SharedComponents/BtcAveragePrice'
import { DateLabel } from '@/MultiSiteViews/SharedComponents/DateLabel'
import {
  DateRange,
  TimeframeControls,
} from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'
import { MultiSiteDateRange } from '@/types'

interface Site {
  name?: string
}
export interface HeaderProps {
  pageTitle: string
  dateRange?: DateRange | MultiSiteDateRange
  onTableDateRangeChange?: (dates: [Date, Date], options: { period: string }) => void
  site?: Site
  breadcrumbMiddleStep?: string
  isExtended?: boolean
  showSiteName?: boolean
  hasSiteSelect?: boolean
  hasBackButton?: boolean
  isMonthSelectVisible?: boolean
  isWeekSelectVisible?: boolean
  backToDestination?: string
  onSiteSelectChange?: (selectedOptions: MosSelectOption[]) => void
  selected?: string[]
}

export const Header: FC<HeaderProps> = ({
  pageTitle,
  site,
  dateRange,
  breadcrumbMiddleStep,
  onTableDateRangeChange = _noop,
  isExtended = false,
  showSiteName = true,
  hasSiteSelect = false,
  hasBackButton = false,
  isMonthSelectVisible = true,
  isWeekSelectVisible = true,
  backToDestination = '',
  onSiteSelectChange = _noop,
}) => {
  const { timezone } = useTimezone()
  const { siteId } = useParams<{ siteId: string }>()
  const { isLoading, averageBtcPrice } = useAverageBtcPrice(dateRange as MultiSiteDateRange)
  const { siteSelectOptions, setSelectedSitesManually } = useMultiSiteMode()
  const selectedSites = useSelector(getSelectedSites)

  const onRangeChangeHandler = (
    dates: [Date, Date] | null,
    options?: { year?: number; month?: number; period?: string },
  ) => {
    if (!dates) return
    const timestamps = getRangeTimestamps(dates, timezone)
    if (!timestamps[0] || !timestamps[1]) return
    const period = options?.period || PERIOD.DAILY
    onTableDateRangeChange([timestamps[0], timestamps[1]], { period })
  }

  const onDurationChangeHandler = () => {
    const start = getBeginningOfMonth()
    const end = getEndOfYesterday()
    onTableDateRangeChange([start, end], { period: PERIOD.DAILY })
  }

  useEffect(() => {
    if (isExtended && !dateRange?.start && !dateRange?.end) {
      onDurationChangeHandler()
    }
  }, [])

  const handleSiteSelectChange = (selectedOptions: string[]) => {
    setSelectedSitesManually(selectedOptions)
    onSiteSelectChange(selectedOptions)
  }

  const title = (() => {
    const siteName = site?.name ? _toUpper(site.name) : 'All Sites'

    if (showSiteName) {
      return (
        <>
          {siteName}
          {'  '}
          <Subheader>
            {breadcrumbMiddleStep && <>&middot; {breadcrumbMiddleStep}&nbsp;</>}
            &middot; {pageTitle}
          </Subheader>
        </>
      )
    }
    return <>{pageTitle}</>
  })()

  return (
    <>
      {isLoading && <Spinner />}
      <HeaderWrapper>
        {hasBackButton ? (
          <HeaderWithBreadcrumbs>
            <Breadcrumbs
              title={_isString(title) ? title : pageTitle}
              destination={
                siteId ? `/sites/${siteId}/${backToDestination}` : `/${backToDestination}`
              }
            />
          </HeaderWithBreadcrumbs>
        ) : (
          <h1>{title}</h1>
        )}

        {isExtended && dateRange && (
          <ExtendedWrapper>
            <DateLabel startDate={new Date(dateRange.start)} endDate={new Date(dateRange.end)} />
            <BtcAveragePrice price={averageBtcPrice} />
          </ExtendedWrapper>
        )}
      </HeaderWrapper>

      {isExtended && (
        <DurationButtonsWrapper>
          <TimeframeControls
            isMonthSelectVisible={isMonthSelectVisible}
            isWeekSelectVisible={isWeekSelectVisible}
            onRangeChange={onRangeChangeHandler}
            dateRange={dateRange}
          />

          {hasSiteSelect && siteSelectOptions?.length > 0 && !siteId && (
            <MosSelect
              options={siteSelectOptions}
              value={selectedSites}
              onChange={handleSiteSelectChange}
              placeholder="Select sites"
            />
          )}
        </DurationButtonsWrapper>
      )}
    </>
  )
}
