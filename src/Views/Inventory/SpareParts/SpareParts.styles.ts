import Button from 'antd/es/button'
import styled from 'styled-components'

import { ListViewActionCol } from '../Inventory.styles'

import { COLOR } from '@/constants/colors'

export const StyledListViewActionCol = styled(ListViewActionCol)`
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  margin-top: 10px;

  button {
    box-shadow: none !important;
  }

  > * {
    width: 100%;
  }

  @media (min-width: 1200px) {
    flex-direction: row;
    align-items: center;
    gap: 4px;
    margin-top: 0;

    > * {
      width: auto;
    }
  }
`

export const RegisterPartButton = styled(Button)`
  color: ${COLOR.SIMPLE_BLACK};
  background-color: ${COLOR.COLD_ORANGE};
`

export const TabsWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin: 30px 0 20px 0;
`
