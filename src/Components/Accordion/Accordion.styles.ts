import styled from 'styled-components'

interface StyledProps {
  $open?: boolean
  $row?: boolean
  $noBorder?: boolean
  $noPadding?: boolean
  $solidBackground?: boolean
}

import { flexColumn, flexCenterRow } from '../../app/mixins'
import { COLOR } from '../../constants/colors'

export const AccordionContainer = styled.div<StyledProps>`
  ${flexColumn};
  border: ${(props) => (props.$open ? `1px solid ${COLOR.WHITE_ALPHA_01}` : 'none')};
  background-color: ${(props) =>
    props.$open && !props.$solidBackground ? COLOR.TRANSPARENT : COLOR.BLACK_ALPHA_05};

  a {
    text-decoration: none;
  }
`

export const AccordionHeader = styled.div<StyledProps>`
  ${flexCenterRow};
  justify-content: space-between;
  font-size: 20px;
  font-weight: 400;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 10px 20px;
  border-bottom: ${({ $noBorder }) => ($noBorder ? 'none' : `1px solid ${COLOR.COLD_ORANGE}`)};

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 8px 16px;
  }
`

const togglerSize = '30px'

export const AccordionToggler = styled.div<StyledProps>`
  ${flexCenterRow};
  width: ${togglerSize};
  height: ${togglerSize};
  background-color: ${COLOR.WHITE_ALPHA_01};
`

export const AccordionContent = styled.div<StyledProps>`
  padding: ${(props) => (props.$noPadding ? 0 : '10px')};
  ${(props) =>
    props.$row &&
    `
    ${flexCenterRow};
    flex-wrap: wrap;
    gap: 20px;
  `};
`
