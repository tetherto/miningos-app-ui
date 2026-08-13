import _includes from 'lodash/includes'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { usePostTokenQuery } from '../app/services/api'
import { authSlice } from '../app/slices/authSlice'
import { getRolesFromAuthToken } from '../app/utils/tokenUtils'

import { useTokenPermissions } from './usePermissions'

import { saveLastVisitedUrl } from '@/app/utils/localStorageUtils'
import { RESPONSE_CODE } from '@/constants'

const { setToken, setPermissions } = authSlice.actions
const POLLING_INTERVAL = 250_000

const useTokenPolling = (authToken: string | null) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { fetchPermissions } = useTokenPermissions()
  const roles = getRolesFromAuthToken(authToken || undefined)

  const { data = {}, error } = usePostTokenQuery(
    { roles },
    {
      pollingInterval: POLLING_INTERVAL,
      skip: !authToken,
    },
  )

  const { token } = data as { token?: string }

  useEffect(() => {
    if (token) {
      dispatch(setToken(token))
      fetchPermissions()
    }
  }, [dispatch, fetchPermissions, token])

  useEffect(() => {
    if (
      error &&
      _includes(
        [RESPONSE_CODE.UNAUTHORIZED, RESPONSE_CODE.SERVER_ERROR],
        (error as { status?: number }).status,
      )
    ) {
      saveLastVisitedUrl(location.pathname + location.search)
      dispatch(setToken(null))
      dispatch(setPermissions(null))
    }
  }, [dispatch, error, location])

  return { token, error }
}

export default useTokenPolling
