import _capitalize from 'lodash/capitalize'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import _size from 'lodash/size'
import _upperCase from 'lodash/upperCase'
import _values from 'lodash/values'
import { lazy, Suspense } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router'

const ListView = lazy(() => import('../../Components/Explorer/List/ListView'))
const DetailsView = lazy(() => import('../../Components/Explorer/DetailsView/DetailsView'))
const NotFoundPage = lazy(() => import('../NotFoundPage/NotFoundPage'))

import {
  ExplorerCol,
  ExplorerViewRow,
  HeaderWrapper,
  MainExplorerView,
  StickyExplorerCol,
} from './Explorer.styles'
import { MinerKpiExport } from './MinerKpiExport'

import { useGetSiteQuery } from '@/app/services/api'
import {
  devicesSlice,
  selectSelectedDevices,
  selectSelectedLVCabinets,
  selectSelectedContainers,
} from '@/app/slices/devicesSlice'
import { TAB } from '@/Components/Explorer/List/ListView.const'
import { LvCabinetDetailsView } from '@/Components/Explorer/LvCabinetDetailsView/LvCabinetDetailsView'
import { Title } from '@/Components/Shared'
import { Spinner } from '@/Components/Spinner/Spinner'
import { CROSS_THING_TYPES } from '@/constants/devices'

const { setSelectedDevices } = devicesSlice.actions

const Explorer = () => {
  const [params] = useSearchParams()
  const dispatch = useDispatch()
  const selectedMiners = useSelector(selectSelectedDevices)
  const selectedLVCabinets = useSelector(selectSelectedLVCabinets)
  const selectedContainers = useSelector(selectSelectedContainers)
  const selectedTab = params.get(TAB)
  const isSelectedLVCabinet = !_isEmpty(selectedLVCabinets)

  const siteQuery = useGetSiteQuery(undefined)
  const siteData = (siteQuery.data as { site?: string } | undefined) ?? {}
  const isSiteLoaded = siteQuery.isSuccess

  const currentSite = _capitalize(_get(siteData, ['site']))

  const handleRemoveAllSelections = () => {
    dispatch(setSelectedDevices([]))
  }

  const handleRemoveDeviceFromSelection = (deviceId: string) => {
    dispatch(setSelectedDevices(_filter(selectedMiners, ({ id }) => id !== deviceId)))
  }

  const isValidTab = _includes(
    _values(_omit(CROSS_THING_TYPES, _upperCase(CROSS_THING_TYPES.POOL))),
    selectedTab,
  )

  if (!isValidTab) {
    return (
      <Suspense fallback={<Spinner />}>
        <NotFoundPage />
      </Suspense>
    )
  }

  const hasSelection =
    isSelectedLVCabinet || _size(selectedMiners) > 0 || _size(selectedContainers) > 0

  return (
    <MainExplorerView>
      <HeaderWrapper>
        <Title>Explorer</Title>
        {selectedTab === CROSS_THING_TYPES.MINER && <MinerKpiExport />}
      </HeaderWrapper>

      <ExplorerViewRow $isMinerTab={selectedTab === CROSS_THING_TYPES.MINER}>
        <ExplorerCol $hasSelection={hasSelection}>
          {isSiteLoaded && (
            <Suspense fallback={<Spinner />}>
              <ListView compactForMobile site={currentSite} />
            </Suspense>
          )}
        </ExplorerCol>
        {hasSelection && (
          <StickyExplorerCol>
            <Suspense fallback={<Spinner />}>
              {isSelectedLVCabinet ? (
                <LvCabinetDetailsView />
              ) : (
                // @TODO: Remove comment after getting DetailsView migrated to TS
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                <DetailsView
                  onRemoveAllSelections={handleRemoveAllSelections}
                  onRemoveDeviceFromSelection={handleRemoveDeviceFromSelection}
                />
              )}
            </Suspense>
          </StickyExplorerCol>
        )}
      </ExplorerViewRow>
    </MainExplorerView>
  )
}

export default Explorer
