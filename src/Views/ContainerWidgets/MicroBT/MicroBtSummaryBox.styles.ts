import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin: 10px 0 10px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid ${COLOR.LIGHT_GREY};
`
