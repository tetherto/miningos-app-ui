import type { FC } from 'react'

import { COLOR } from '@/constants/colors'

interface InventoryProps {
  isActive: boolean
}

export const Inventory: FC<InventoryProps> = ({ isActive }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
    <path
      stroke={isActive ? COLOR.COLD_ORANGE : COLOR.SIDEBAR_ITEM}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M12.5 3H15v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3h2.5M6 2h6v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2Z"
    />
  </svg>
)
