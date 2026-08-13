import { Suspense } from 'react'
import type { ComponentType } from 'react'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { Spinner } from '@/Components/Spinner/Spinner'

interface LazyTabWrapperProps {
  Component: ComponentType<{ data?: UnknownRecord }>
  data?: UnknownRecord
}

export const LazyTabWrapper = ({ Component, data }: LazyTabWrapperProps) => (
  <Suspense fallback={<Spinner />}>
    <Component data={data} />
  </Suspense>
)
