import type { FC } from 'react'

import { COLOR } from '@/constants/colors'

interface MinersOverviewProps {
  isActive: boolean
}

export const MinersOverview: FC<MinersOverviewProps> = ({ isActive }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
    <path
      stroke={isActive ? COLOR.COLD_ORANGE : COLOR.SIDEBAR_ITEM}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M15 7H3m12 0a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1m12 0a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1M3 7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1m12 0H3m12 0a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1m.5-6h3m-3 4h3m-3 4h3"
    />
  </svg>
)
