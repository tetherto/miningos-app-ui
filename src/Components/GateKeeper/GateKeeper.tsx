import _isString from 'lodash/isString'
import { FC, ReactElement, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { selectPermissions, selectToken } from '../../app/slices/authSlice'
import { getSignInRedirectUrl } from '../../app/utils/authUtils'
import { useCheckPerm } from '../../hooks/usePermissions'

import type { PermissionCheck } from '@/hooks/hooks.types'

interface GateKeeperProps {
  config: PermissionCheck
  children?: ReactElement
  redirect?: boolean | string
}

const GateKeeper: FC<GateKeeperProps> = ({ config, children, redirect = true }) => {
  const allowed = useCheckPerm(config)
  const navigate = useNavigate()
  const authToken = useSelector(selectToken)
  const permissions = useSelector(selectPermissions)

  // Permissions are still loading — don't redirect yet
  const permissionsLoading = !!authToken && permissions === null

  useEffect(() => {
    if (permissionsLoading || allowed) {
      return
    }

    if (redirect === true) {
      navigate(getSignInRedirectUrl(authToken))
    } else if (_isString(redirect)) {
      navigate(redirect)
    }
  }, [allowed, permissionsLoading, redirect, authToken, navigate])

  if (!allowed) {
    return null
  }

  return children ?? null
}

export default GateKeeper
