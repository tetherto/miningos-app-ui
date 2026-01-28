import { FC } from 'react'

import { COLOR } from '../../constants/colors'

import { Icon } from './ChartIcon.styles'

interface ChartIconProps {
  $inverted?: boolean
}

export const ChartIcon: FC<ChartIconProps> = ({ $inverted = false }) => {
  const svgStyle = { transform: $inverted ? 'scaleY(-1)' : 'none' }
  return (
    <Icon>
      <svg
        width="17"
        height="10"
        viewBox="0 0 17 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={svgStyle}
      >
        <path
          fill={$inverted ? COLOR.RED : COLOR.GRASS_GREEN}
          d="M12.8566 2.60099H10.484V0.606201H16.1872V6.01938H14.1836V4.10368L9.30643 8.69083L5.99349 5.58L1.87209 9.44656L0.51001 7.98782L5.99349 2.83826L9.30643 5.9403L12.8566 2.60099Z"
        />
      </svg>
    </Icon>
  )
}
