import { LeftOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import { flexColumn, flexRow } from '../../app/mixins'
import { Title } from '../Shared'

import { COLOR } from '@/constants/colors'

export const BreadcrumbsWrapper = styled.div`
  ${flexRow};
  align-items: center;
  gap: 20px;
  grid-column: 1 / -1;
  padding: 10px 0;

  @media (max-width: 480px) {
    ${flexColumn};
    align-items: baseline;
  }
`

export const BackWrapper = styled.div`
  ${flexRow};
  gap: 5px;
  align-items: center;
  cursor: pointer;
`

export const BackText = styled.div`
  color: ${COLOR.COLD_ORANGE};
  font-weight: 500;
  font-size: 16px;
`

export const BreadcrumbTitle = styled(Title)`
  margin: 0 !important;
`

export const LeftOutlinedIcon = styled(LeftOutlined)`
  color: ${COLOR.COLD_ORANGE};
  font-size: 20px;
`
