import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import { useSelector } from 'react-redux'

import { selectPermissions } from '../app/slices/authSlice'
import { checkPermission, type AuthConfig, type PermissionCheck } from '../app/utils/authUtils'

/**
 * @typedef {keyof typeof AUTH_CAPS} CapKey
 */
export const useHasPerms = () => {
  const config = useSelector(selectPermissions) as AuthConfig | null | undefined
  return (req: string | string[] | PermissionCheck) => {
    if (_isString(req) || _isArray(req)) {
      return checkPermission(config, { perm: _isArray(req) ? req[0] : req })
    }

    return checkPermission(config, req)
  }
}
