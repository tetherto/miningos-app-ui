import notification from 'antd/es/notification'
import _isString from 'lodash/isString'
import { lazy, Suspense, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'

import {
  ActionsSidebarContainer,
  Content,
  ContentOutletContainer,
  LayoutRoot,
  LocationRestrictedOverlay,
  MainWrapper,
  OutletContainer,
} from './Layout.styles'

import {
  useGetFeatureConfigQuery,
  useGetFeaturesQuery,
  useGetUserinfoQuery,
} from '@/app/services/api'
import { isUseMockdataEnabled } from '@/app/services/api.utils'
import { selectIsActionsSidebarPinned } from '@/app/slices/actionsSidebarSlice'
import { userInfoSlice } from '@/app/slices/userInfoSlice'
import { saveLastVisitedUrl } from '@/app/utils/localStorageUtils'
import { Header } from '@/Components/Header/Header'
import { Sidebar } from '@/Components/Sidebar/Sidebar'
import { Spinner } from '@/Components/Spinner/Spinner'
import { WEBAPP_NAME } from '@/constants'
import { ActionsProvider } from '@/contexts/ActionsContext'
import useAuthToken from '@/hooks/useAuthToken'
import { useDemoToken } from '@/hooks/useDemoToken'
import useDeviceResolution from '@/hooks/useDeviceResolution'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useSidebar } from '@/hooks/useSidebar'
import { UserInfoState } from '@/types'
import { UserInfo } from '@/types/api'

// Lazy load ActionsSidebar - defer loading until after initial render
const ActionsSidebar = lazy(() => import('@/Components/ActionsSidebar/ActionsSidebar'))

const Layout = () => {
  const authToken = useAuthToken()
  let [searchParams] = useSearchParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const isActionsSidebarPinned = useSelector(selectIsActionsSidebarPinned)
  const { isMobile } = useDeviceResolution()
  const { isMultiSiteModeEnabled, siteList, isLoading } = useMultiSiteMode()
  const { isExpanded, toggle } = useSidebar(isMobile)

  useDemoToken()
  useDocumentTitle()

  const skipApiCalls = !authToken

  type UserInfoResponse = UserInfo & {
    metadata?: Record<string, unknown>
  }

  const userinfoQuery = useGetUserinfoQuery(undefined, {
    skip: skipApiCalls,
    // Don't refetch on mount/focus to reduce API calls
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  const data = (userinfoQuery.data as UserInfoResponse | undefined) ?? undefined
  const { isError, isLoading: isUserInfoLoading } = userinfoQuery

  useGetFeaturesQuery(undefined, {
    skip: skipApiCalls,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  useGetFeatureConfigQuery(undefined, {
    skip: skipApiCalls,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })

  const getUserInfo = (key: string): string | undefined => {
    const value = data?.metadata?.[key] ?? data?.[key]
    return _isString(value) ? value : undefined
  }

  const userName = getUserInfo('given_name')
  const userEmail = getUserInfo('email')
  const userPicture = getUserInfo('picture')
  const isGeoLocationRestricted = Boolean(data?.isGeoLocationRestricted)

  useEffect(() => {
    if (data) {
      dispatch(userInfoSlice.actions.setUserInfo(data as UserInfoState))
    }
  }, [data])

  useEffect(() => {
    if (isError) {
      notification.error({
        message: 'Error fetching user information',
        description: 'Please try again later.',
        duration: 5,
      })
    }
  }, [isError])

  if (!authToken && !isUseMockdataEnabled) {
    saveLastVisitedUrl(location.pathname + location.search)
    const errorQueryParam = searchParams.has('error') ? `/?${searchParams.toString()}` : ''
    return <Navigate to={`/signin${errorQueryParam}`} />
  }

  if ((isLoading || isUserInfoLoading) && !data) {
    return (
      <LayoutRoot>
        <Spinner />
      </LayoutRoot>
    )
  }

  return (
    <ActionsProvider>
      <LayoutRoot $frozen={isGeoLocationRestricted}>
        {!isUserInfoLoading && !!data && (
          <Header
            name={userName}
            email={userEmail}
            picture={userPicture}
            isMultiSiteModeEnabled={isMultiSiteModeEnabled}
          />
        )}
        <MainWrapper>
          <Sidebar
            isMobile={isMobile}
            siteList={siteList}
            onToggle={toggle}
            isMultiSiteModeEnabled={isMultiSiteModeEnabled}
          />
          <Content $isExpanded={isExpanded}>
            <ContentOutletContainer $isPinned={isActionsSidebarPinned && !isMobile}>
              <OutletContainer $isPinned={isActionsSidebarPinned && !isMobile}>
                {isGeoLocationRestricted ? (
                  <LocationRestrictedOverlay>
                    <b>{WEBAPP_NAME}</b>
                    &nbsp;
                    <span>is not available in this jurisdiction.</span>
                  </LocationRestrictedOverlay>
                ) : (
                  <Outlet />
                )}
              </OutletContainer>

              {!isLoading && !isMultiSiteModeEnabled && (
                <ActionsSidebarContainer $isPinned={isActionsSidebarPinned && !isMobile}>
                  <Suspense fallback={null}>
                    <ActionsSidebar />
                  </Suspense>
                </ActionsSidebarContainer>
              )}
            </ContentOutletContainer>
          </Content>
        </MainWrapper>
      </LayoutRoot>
    </ActionsProvider>
  )
}

export default Layout
