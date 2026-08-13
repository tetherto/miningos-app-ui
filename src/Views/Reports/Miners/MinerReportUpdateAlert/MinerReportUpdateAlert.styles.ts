import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const MinerReportUpdateAlertWrapper = styled.div`
  ${flexRow};
  padding: 17px;
  align-items: center;
  border: 1px solid ${COLOR.COLD_ORANGE_ALPHA_02};
  gap: 16px;
`

export const AlertBody = styled.div`
  ${flexColumn};
  gap: 8px;
  flex: 1;
`

export const AlertTitle = styled.div`
  color: ${COLOR.COLD_ORANGE};
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.35px;
`

export const AlertMessage = styled.div`
  font-weight: 400;
  font-size: 12px;
  leading-trim: NONE;
  line-height: 20px;
  color: ${COLOR.WHITE_ALPHA_07};
`
