import { COLOR } from '@/constants/colors'

interface CommentIconProps {
  isActive?: boolean
}

export const CommentIcon = ({ isActive }: CommentIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
    <path
      stroke={isActive ? COLOR.COLD_ORANGE : COLOR.SIDEBAR_ITEM}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m7 12.993 2 2.998 2-2.998h4c.553 0 1-.447 1-1V3C16 2.447 15.553 2 15 2H3c-.553 0-1 .447-1 1v8.993c0 .553.447 1 1 1h4Z"
      clipRule="evenodd"
    />
  </svg>
)
