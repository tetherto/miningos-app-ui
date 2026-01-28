import _find from 'lodash/find'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _intersection from 'lodash/intersection'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _split from 'lodash/split'

import { USER_ROLE } from '../../constants/permissions.constants'

import { getRolesFromAuthToken } from './tokenUtils'

export interface AuthConfig {
  superAdmin?: boolean
  permissions?: string[]
  write?: boolean
  caps?: string[]
}

export interface PermissionCheck {
  perm?: string
  write?: boolean
  cap?: string
}

export const checkPermission = (
  config: AuthConfig | null | undefined,
  { perm, write, cap }: PermissionCheck,
): boolean => {
  if (!config) {
    return false
  }

  const { superAdmin, permissions, write: writePermission, caps } = config

  if (superAdmin) {
    return true
  }

  if (write) {
    return !!writePermission
  }

  if (cap) {
    return _includes(caps, cap)
  }

  if (perm) {
    if (_includes(permissions, perm)) {
      return true
    }

    // Check between segregated read and write
    const [requestedAccess, requestLevel] = _split(perm, ':')
    const requestedLevels = _split(requestLevel, '')

    return !_isNil(
      _find(permissions, (permission: unknown) => {
        const [access, levels] = _split(String(permission ?? ''), ':')
        const accessPresent = access === requestedAccess
        const levelPresent =
          _intersection(requestedLevels, _split(levels, '')).length === requestedLevels.length
        return accessPresent && levelPresent
      }),
    )
  }

  return false
}

export const getSignInRedirectUrl = (authToken: string | null | undefined): string => {
  let redirectUrl = '/'

  if (_isEmpty(authToken)) {
    return redirectUrl
  }

  switch (_head(getRolesFromAuthToken(authToken ?? undefined) ?? [])) {
    case USER_ROLE.REPORTING_TOOL_MANAGER:
      redirectUrl = '/reporting-tool'
      break
    default:
      break
  }

  return redirectUrl
}
