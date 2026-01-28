import styled, { css } from 'styled-components'

interface StyledProps {
  $color?: string
  $isHighlighted?: unknown
  $flash?: unknown
}

import { flashTextAnimation } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const DataRowContainer = styled.div<StyledProps>`
  display: table-row;
  color: ${(props) =>
    // eslint-disable-next-line no-nested-ternary
    props.$color ? props.$color : props.$isHighlighted ? COLOR.WHITE : COLOR.DARK_GREY};
  font-size: ${(props) => (props.$isHighlighted ? '14px' : '13px')};
  font-weight: ${(props) => (props.$isHighlighted ? 600 : 400)};

  ${({ $flash, $color }) =>
    $flash
      ? css`
          animation: ${flashTextAnimation($color as string | undefined, COLOR.DARK_GREY)} 1s
            infinite;
        `
      : ''}
`

export const Label = styled.div<StyledProps>`
  display: table-cell;
`

export const Value = styled(Label)<StyledProps>`
  padding-left: 8px;
`

export const Units = styled(Value)<StyledProps>`
  padding-left: 4px;
`
