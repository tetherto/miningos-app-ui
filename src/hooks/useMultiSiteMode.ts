import _capitalize from 'lodash/capitalize'
import _find from 'lodash/find'
import _isEqual from 'lodash/isEqual'
import _map from 'lodash/map'
import _toLower from 'lodash/toLower'
import { useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { useGetFeatureConfigQuery } from '@/app/services/api'
import { selectToken } from '@/app/slices/authSlice'
import {
  getIsManualSelection,
  getSelectedSites,
  setSelectedSites,
  setSelectedSitesManually,
} from '@/app/slices/multiSiteSlice'

interface Site {
  id: string
  name: string
}

/**
 * Multi-site mode hook: reads feature config, normalizes site list, and manages selected sites.
 *
 * Enablement:
 * - In the dashboard-app-node repo, set `featureConfig.isMultiSiteModeEnabled = true`
 *   and populate `featureConfig.siteList` in config/common.json (or env-specific file).
 *   Example: [{ id: "site-a", name: "Site A" }, ...]
 * Notes:
 * - IDs are normalized to lower-case; names are capitalized.
 * - Feature config is fetched only when authenticated.
 *
 * Behavior:
 * - If route param `:siteId` is present, that site is selected.
 * - When no `:siteId` and the selection wasn't made manually, all sites are selected.
 *
 * @returns {{
 *   site: MultiSiteNavigationSite | object,
 *   siteId: string | undefined,
 *   selectedSites: string[],
 *   setSelectedSites: (sites: string[]) => void,
 *   setSelectedSitesManually: (sites: string[]) => void,
 *   siteSelectOptions: {label: string, value: string}[],
 *   isMultiSiteModeEnabled: boolean | undefined,
 *   siteList: MultiSiteNavigationSite[] | undefined,
 *   getSiteById: (id: string) => MultiSiteNavigationSite | object,
 *   isLoading: boolean
 * }}
 */
export const useMultiSiteMode = () => {
  const { siteId } = useParams()
  const dispatch = useDispatch()
  const selectedSites = useSelector(getSelectedSites)
  const isManualSelection = useSelector(getIsManualSelection)
  const authToken = useSelector(selectToken)

  const { data: featureConfig, isLoading } = useGetFeatureConfigQuery(undefined, {
    skip: !authToken, // Skip if not authenticated
  })
  const { isMultiSiteModeEnabled, siteList } =
    (featureConfig as {
      isMultiSiteModeEnabled?: boolean
      siteList?: Array<{ id: string; name: string }>
    }) || {}

  // Memoize updateSites to prevent recreating on every render
  const updateSites = useCallback(
    (sites: string[]) => {
      dispatch(setSelectedSites(sites))
    },
    [dispatch],
  )
  const updateSitesManually = useCallback(
    (sites: string[]) => {
      dispatch(setSelectedSitesManually(sites))
    },
    [dispatch],
  )

  useEffect(() => {
    if (siteId) {
      dispatch(setSelectedSites([_toLower(siteId)]))
    }
  }, [siteId, dispatch])

  // Memoize processedSiteList to prevent recreating on every render
  const processedSiteList = useMemo(
    () =>
      _map(siteList, (site: Site) => {
        const id = _toLower(site.id)
        const name = _capitalize(site.name)
        return {
          id,
          name,
          url: `/sites/${id}`,
          label: name,
          value: id,
        }
      }),
    [siteList],
  )

  // Memoize siteSelectOptions to prevent recreating on every render
  const siteSelectOptions = useMemo(
    () => _map(processedSiteList, ({ id, name }) => ({ label: name, value: id })),
    [processedSiteList],
  )

  // Reset to all sites when navigating back to "All sites" view, unless manually selected
  useEffect(() => {
    if (!siteId && siteSelectOptions?.length && !isManualSelection) {
      // Only reset to all sites if the selection wasn't made manually by the user
      // This preserves manual site selections across different pages
      const allSiteIds = _map(siteSelectOptions, ({ value }) => value)
      // Only dispatch if the selected sites are different to prevent infinite loops
      if (!_isEqual(selectedSites, allSiteIds)) {
        updateSites(allSiteIds)
      }
    }
  }, [siteId, siteSelectOptions, isManualSelection, updateSites, selectedSites])

  const getSiteById = (id: string) =>
    _find(siteList, (s: Site) => _toLower(s.id) === _toLower(id)) || {}

  const site = getSiteById(siteId || '')

  return {
    site,
    siteId,
    selectedSites,
    setSelectedSites: updateSites,
    setSelectedSitesManually: updateSitesManually,
    siteSelectOptions,
    isMultiSiteModeEnabled,
    siteList: processedSiteList,
    getSiteById,
    isLoading,
  }
}
