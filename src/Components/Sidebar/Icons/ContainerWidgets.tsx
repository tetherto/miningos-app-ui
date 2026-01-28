import type { FC } from 'react'

import { COLOR } from '@/constants/colors'

interface ContainerWidgetsProps {
  isActive: boolean
}

export const ContainerWidgets: FC<ContainerWidgetsProps> = ({ isActive }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
    <path
      stroke={isActive ? COLOR.COLD_ORANGE : COLOR.SIDEBAR_ITEM}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M6.5 10h5M2 2h14v4H2V2Zm1 4v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6H3Z"
    />
  </svg>
)
