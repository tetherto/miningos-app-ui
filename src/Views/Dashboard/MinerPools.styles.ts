import styled from 'styled-components'

import { flexCenterRow } from '../../app/mixins'
import { COLOR } from '../../constants/colors'

export const EmptyPoolsContainer = styled.div`
  width: 100%;
  padding: 20px;
  ${flexCenterRow};

  /* Improve contrast for accessibility (WCAG AA compliance) */
  .ant-empty-description {
    color: ${COLOR.WHITE_ALPHA_07}; /* Better contrast on dark background */
  }
`
