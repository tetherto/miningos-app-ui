import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { isUseMockdataEnabled } from '../app/services/api.utils'
import { authSlice, selectToken } from '../app/slices/authSlice'

/**
 * Auto-sets demo token in demo mode to bypass authentication
 * Used in Layout and SignIn to enable demo mode without authToken parameter
 */
export const useDemoToken = (): void => {
  const authToken = useSelector(selectToken)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!authToken && isUseMockdataEnabled) {
      dispatch(authSlice.actions.setToken('DEMO_MODE_TOKEN'))
    }
  }, [authToken, dispatch])
}
