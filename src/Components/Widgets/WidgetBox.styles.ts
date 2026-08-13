import { styled } from 'styled-components'

interface StyledProps {
  $isActive?: boolean
}

import { cutCornerBefore } from '@/app/mixins'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import { COLOR } from '@/constants/colors'

const cutEdgeSize = '8px'

export const WidgetBox = styled(ContentBox)<StyledProps>`
  position: relative;
  background-color: ${COLOR.EBONY};
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid;
  border-color: ${(props) => (props.$isActive ? COLOR.COLD_ORANGE : COLOR.DARKER_GREY)};
  transition: border-color 0.4s;

  @media (min-width: 768px) {
    &:hover {
      border-color: ${COLOR.COLD_ORANGE};

      &:before {
        border-top-color: ${COLOR.COLD_ORANGE};
      }
    }
  }

  clip-path: polygon(${cutEdgeSize} 0, 100% 0, 100% 100%, 0 100%, 0 ${cutEdgeSize});

  ${cutCornerBefore(cutEdgeSize)}

  &:before {
    border-top-color: ${(props) => (props.$isActive ? COLOR.COLD_ORANGE : COLOR.DARKER_GREY)};
  }
`
