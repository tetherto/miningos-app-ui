import { useEffect } from 'react'
import { useLocation } from 'react-router'

import { formatPageTitle } from '@/app/utils/format'
import { WEBAPP_NAME } from '@/constants'

export const useDocumentTitle = (): void => {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = `${formatPageTitle(pathname)} | ${WEBAPP_NAME}`
  }, [pathname])
}
