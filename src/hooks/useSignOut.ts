import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { authSlice, selectToken } from '../app/slices/authSlice'
import { saveLastVisitedUrl } from '../app/utils/localStorageUtils'

import type { RootState } from '@/types/redux'

const { setToken, setPermissions } = authSlice.actions

const useSignOut = (): string | null => {
  const authToken = useSelector((state: RootState) => selectToken(state))
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    if (!authToken) return

    saveLastVisitedUrl(location.pathname + location.search)

    dispatch(setToken(null))
    dispatch(setPermissions(null))
  }, [authToken, dispatch, location])

  return authToken
}

export default useSignOut
