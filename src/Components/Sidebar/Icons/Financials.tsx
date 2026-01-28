import { COLOR } from '@/constants/colors'

interface FinancialsProps {
  isActive?: boolean
}

export const Financials = ({ isActive }: FinancialsProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path
      stroke={isActive ? COLOR.COLD_ORANGE : COLOR.SIDEBAR_ITEM}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M0.75 0.75V15.25H15.25M2.75 12.25L6.75 6.25L9.75 10.25L14.75 3.25"
    />
  </svg>
)
