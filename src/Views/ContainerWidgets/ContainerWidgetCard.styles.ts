import styled, { css } from 'styled-components'

import { flashAnimation } from '@/app/mixins'
import { WidgetBox } from '@/Components/Widgets/WidgetBox.styles'
import { COLOR } from '@/constants/colors'

export const ContainerWidgetCardRoot = styled(WidgetBox)<{ $flash: boolean }>`
  width: 100%;
  max-width: 370px;
  cursor: pointer;

  @media (min-width: 768px) {
    max-width: min(420px, 100%);
  }

  ${({ $flash }) =>
    $flash &&
    css`
      animation: ${flashAnimation(COLOR.BRICK_RED, COLOR.DARK)} 2.5s ease-in-out infinite;
    `}

  & > *:nth-child(1) > * {
    padding: 16px;

    &:not(:last-child) {
      border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
    }
  }
`
