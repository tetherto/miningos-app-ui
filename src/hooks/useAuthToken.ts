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

    // Copy rather than mutate: `searchParams` is the live object this effect
    // depends on, and the update is applied in a transition, so mutating it
    // would let a re-run observe the stripped params before the URL commits.
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('authToken')

    setSearchParams(nextParams, { replace: true })
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
