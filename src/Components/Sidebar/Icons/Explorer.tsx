import type { FC } from 'react'

import { COLOR } from '@/constants/colors'

interface ExplorerProps {
  isActive: boolean
}

export const Explorer: FC<ExplorerProps> = ({ isActive }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
    <path
      stroke={isActive ? COLOR.COLD_ORANGE : COLOR.SIDEBAR_ITEM}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M1 13V3a1 1 0 0 1 1-1h4l2 2h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Z"
    />
  </svg>
)
