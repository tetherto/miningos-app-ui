import { Link } from 'react-router'
import styled from 'styled-components'

import { commonTextStyles, flexCenter, upperCaseText } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const ReportNavWrapper = styled.div`
  grid-column: 1 / -1;
`

export const ReportNavTitle = styled.div`
  margin-bottom: 30px ${commonTextStyles};
  ${upperCaseText};
`

export const ReportLinksContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  width: 100%;
`

export const ReportLinkBtn = styled.div`
  ${flexCenter};
  width: 100%;
  height: 100px;
  border-radius: 0;
  color: ${COLOR.WHITE};
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  border: 1px solid ${COLOR.ORANGE};
  cursor: pointer;
  padding: 0 10px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`

export const ReportLink = styled(Link)`
  text-decoration: none;
  flex: '1 1 160px';
`
