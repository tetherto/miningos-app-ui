import Button from 'antd/es/button'
import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const Label = styled.div`
  color: ${COLOR.WHITE_ALPHA_05};
`

export const Value = styled.div`
  color: ${COLOR.WHITE};
`

export const ChartsSection = styled.div`
  display: grid;
  gap: 30px;
  grid-template-columns: 1fr;

  @media (min-width: 1440px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export const StyledButton = styled(Button)`
  height: 36px;
`

export const SiteOperationsCardWrapper = styled.div`
  gap: 16px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`
