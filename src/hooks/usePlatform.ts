import _toLower from 'lodash/toLower'
import { useEffect, useState } from 'react'

import { OsTypes } from '@/constants/platforms'
import type { OsTypeValue } from '@/constants/platforms'

const detectPlatform = (): OsTypeValue | 'unknown' => {
  const userAgent = _toLower(navigator.userAgent)

  if (/iphone|ipad|ipod/.test(userAgent)) return OsTypes.IOS
  if (/android/.test(userAgent)) return OsTypes.Android
  if (/mac os/.test(userAgent)) return OsTypes.MAC
  if (/windows nt/.test(userAgent)) return OsTypes.Windows
  if (/linux/.test(userAgent)) return OsTypes.Linux

  return 'unknown'
}

const usePlatform = (): OsTypeValue | 'unknown' => {
  const [platform, setPlatform] = useState<OsTypeValue | 'unknown'>('unknown')

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [platform])

  return platform
}

export default usePlatform
