import { COLOR } from '../../constants/colors'

import { LightningIcon } from './styles'

export const Lightning = ({ $color = COLOR.GRASS_GREEN, $inverted = false }) => (
  <LightningIcon $inverted={$inverted}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" fill="none">
      <path
        fill={$color}
        d="M12.347 2.101H9.974V.106h5.703V5.52h-2.003V3.604L8.796 8.19 5.483 5.08l-4.12 3.867L0 7.487l5.483-5.149L8.796 5.44l3.55-3.339Z"
      />
    </svg>
  </LightningIcon>
)
