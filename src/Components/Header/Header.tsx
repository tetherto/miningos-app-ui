import { ClockCircleOutlined, MenuOutlined } from '@ant-design/icons'
import Dropdown from 'antd/es/dropdown'
import type { MenuProps } from 'antd/es/menu'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import useTimezone from '../../hooks/useTimezone'

import AlarmsHeader from './AlarmsHeader/AlarmsHeader'
import AlertsHeader from './AlertsHeader/AlertsHeader'
import {
  ActionsWrapper,
  EmailWrapper,
  HeaderButtonWrapper,
  HeaderTopRow,
  HeaderWrapper,
  IconsWrapper,
  LogoWrapper,
  StatsWrapper,
  TimezoneIconContainer,
  TimezoneLabelOuterContainer,
  TimezoneLableCurrentTimezone,
  UserInfoWrapper,
} from './Header.styles'
import HeaderStats from './HeaderStats/HeaderStats'
import { Avatar } from './Icons/Avatar'
import MosLogoPng from './Icons/mos-logo.png'
import MosLogoWebP from './Icons/mos-logo.webp'
import { SignOut } from './Icons/SignOut'
import { PendingActionsMenu } from './PendingActionsMenu/PendingActionsMenu'
import { TimezoneSelectionDialog } from './TimezoneSelection/TimezoneSelectionDialog'

import { authSlice } from '@/app/slices/authSlice'
import { TOGGLE_SIDEBAR } from '@/app/slices/themeSlice'
import { saveLastVisitedUrl } from '@/app/utils/localStorageUtils'
import { COLOR } from '@/constants/colors'
import { ROUTE } from '@/constants/routes'
import { useUserRole } from '@/hooks/useUserRole'

const USER_MENU_KEY = {
  MODE: 'mode',
  TIMEZONE: 'timezone',
  SIGNOUT: 'signout',
}

interface HeaderProps {
  name?: string
  email?: string
  picture?: string
  isMultiSiteModeEnabled?: boolean
}

const Header = ({ name, email, picture, isMultiSiteModeEnabled = false }: HeaderProps) => {
  const userRole = useUserRole()
  const navigate = useNavigate()
  const location = useLocation()

  const { timezone } = useTimezone()
  const [isTimezoneSelectionOpen, setIsTimezoneSelectionOpen] = useState(false)
  const dispatch = useDispatch()
  const logoImgRef = useRef<HTMLImageElement>(null)

  // Set fetchpriority attribute directly on DOM element to avoid React warning
  useEffect(() => {
    if (logoImgRef.current) {
      logoImgRef.current.setAttribute('fetchpriority', 'high')
    }
  }, [])

  const handleSignOut = () => {
    saveLastVisitedUrl(location.pathname + location.search)

    dispatch(authSlice.actions.setToken(null))
    dispatch(authSlice.actions.setPermissions(null))
    navigate(ROUTE.SIGN_IN)
  }

  const items: MenuProps['items'] = [
    {
      label: (
        <UserInfoWrapper>
          <Avatar color={COLOR.WHITE} src={picture} />

          <div>
            {name}
            <EmailWrapper>{email}</EmailWrapper>
            {userRole?.label}
          </div>
        </UserInfoWrapper>
      ),
      type: 'group',
    },
    {
      type: 'divider',
    },
    {
      label: (
        <TimezoneLabelOuterContainer>
          <>Change Timezone </>{' '}
          <TimezoneLableCurrentTimezone>Current: {timezone}</TimezoneLableCurrentTimezone>
        </TimezoneLabelOuterContainer>
      ),
      icon: (
        <TimezoneIconContainer>
          <ClockCircleOutlined />
        </TimezoneIconContainer>
      ) as ReactNode,
      key: USER_MENU_KEY.TIMEZONE,
    },
    {
      label: (<div>Sign Out</div>) as ReactNode,
      icon: (<SignOut />) as ReactNode,
      key: USER_MENU_KEY.SIGNOUT,
    },
  ]

  const onActionClick = ({ key }: { key: string }) => {
    if (key === USER_MENU_KEY.TIMEZONE) {
      setIsTimezoneSelectionOpen(true)
    }
    if (key === USER_MENU_KEY.SIGNOUT) {
      handleSignOut()
    }
  }

  return (
    <HeaderWrapper>
      <HeaderTopRow>
        <IconsWrapper>
          <MenuOutlined
            style={{ color: COLOR.WHITE_ALPHA_07, fontSize: 28 }}
            onClick={() => dispatch({ type: TOGGLE_SIDEBAR })}
          />
          <Link to={ROUTE.HOME}>
            <LogoWrapper>
              <picture>
                <source srcSet={MosLogoWebP} type="image/webp" />
                <img ref={logoImgRef} src={MosLogoPng} alt="Mos logo" width={135} height={30} />
              </picture>
            </LogoWrapper>
          </Link>
        </IconsWrapper>
        <StatsWrapper>{!isMultiSiteModeEnabled && <HeaderStats />}</StatsWrapper>
        <ActionsWrapper>
          {!isMultiSiteModeEnabled && (
            <>
              <AlertsHeader />
              <AlarmsHeader />
              <PendingActionsMenu />
            </>
          )}
          <Dropdown
            menu={{
              items,
              onClick: onActionClick,
            }}
            placement="bottomLeft"
            trigger={['click']}
            overlayClassName="header-dropdown-overlay"
          >
            <HeaderButtonWrapper>
              <Avatar />
            </HeaderButtonWrapper>
          </Dropdown>
        </ActionsWrapper>
      </HeaderTopRow>
      <TimezoneSelectionDialog
        open={isTimezoneSelectionOpen}
        handleCancel={() => setIsTimezoneSelectionOpen(false)}
      />
    </HeaderWrapper>
  )
}

export { Header }
