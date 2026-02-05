import { Link } from 'react-router'
import styled from 'styled-components'

import { flexAlign } from '@/app/mixins'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import { COLOR } from '@/constants/colors'

export const BaseRow = styled.div`
  padding: 0 10px;
`

export const TopRow = styled(BaseRow)`
  ${flexAlign};
  column-gap: 20px;
  margin: 20px 0;
`

export const BackLink = styled(Link)`
  font-size: 25px;
`

export const CabinetTitle = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${COLOR.WHITE};
  text-transform: uppercase;
`

export const BoxTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${COLOR.WHITE};
  margin-bottom: 20px;
`

export const BoxTitleSmall = styled(BoxTitle)`
  font-size: 14px;
  font-weight: 600;
  color: ${COLOR.WHITE};
  text-align: center;
  margin-bottom: 20px;
`
export const BoxValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => (props.color ? props.color : COLOR.WHITE)};
  text-align: center;
`

export const ContentBoxSmall = styled(ContentBox)`
  border-width: 1px;
  padding: 20px;
`
