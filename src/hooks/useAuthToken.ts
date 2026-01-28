import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams, useLocation } from 'react-router-dom'

import { authSlice, selectToken } from '../app/slices/authSlice'
import { saveLastVisitedUrl } from '../app/utils/localStorageUtils'

import { useTokenPermissions } from './usePermissions'
import useTokenPolling from './useTokenPolling'

const { setToken } = authSlice.actions

const useAuthToken = () => {
  const authToken = useSelector(selectToken)
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    const token = searchParams.get('authToken')
    if (!token) return
    if (authToken === token) return

    searchParams.delete('authToken')
    setSearchParams(searchParams)
    dispatch(setToken(token))
  }, [searchParams, setSearchParams, authToken, dispatch])

  const { error } = useTokenPolling(authToken)

  useEffect(() => {
    if (error && !authToken) {
      saveLastVisitedUrl(location.pathname + location.search)
    }
  }, [error, authToken, location])

  useTokenPermissions()

  return authToken
}

export default useAuthToken
