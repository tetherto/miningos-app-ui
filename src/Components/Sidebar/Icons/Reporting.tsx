import type { FC } from 'react'

import { COLOR } from '@/constants/colors'

interface ReportingProps {
  isActive: boolean
}

export const Reporting: FC<ReportingProps> = ({ isActive }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
    <path
      stroke={isActive ? COLOR.COLD_ORANGE : COLOR.SIDEBAR_ITEM}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M6 8.995h6m-6 2.998L12 12M6 5.997 10 6m4 10H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h8l3 3v10a1 1 0 0 1-1 1Z"
    />
  </svg>
)
