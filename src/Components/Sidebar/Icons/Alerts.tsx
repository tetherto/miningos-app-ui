import type { FC } from 'react'

import { COLOR } from '@/constants/colors'

interface AlertsProps {
  isActive: boolean
}

export const Alerts: FC<AlertsProps> = ({ isActive }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
    <path
      stroke={isActive ? COLOR.COLD_ORANGE : COLOR.SIDEBAR_ITEM}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M2.5 12h13M4 12V7a5 5 0 0 1 10 0v5m-7 1.5v.5a2 2 0 1 0 4 0v-.5"
    />
  </svg>
)
