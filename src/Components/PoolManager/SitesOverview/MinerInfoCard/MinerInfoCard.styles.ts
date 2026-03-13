import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const MinerInfoCardWrapper = styled.div`
  ${flexColumn};
  font-family: JetBrains Mono;
  font-weight: 400;
  font-style: Regular;
  leading-trim: NONE;
  letter-spacing: 0%;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const Header = styled.div`
  ${flexColumn};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 24px;
  gap: 12px;
`

export const Title = styled.div`
  font-size: 18px;
  line-height: 28px;
`

export const SubTitle = styled.div`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const Pdu = styled.div`
  font-size: 14px;
  line-height: 14px;
  letter-spacing: 0%;
`

export const Socket = styled.div`
  font-size: 14px;
  line-height: 100%;
  ${flexRow};
  padding: 10px;
  background-color: ${COLOR.WHITE_ALPHA_01};
  color: ${COLOR.WHITE};
  gap: 6px;
  align-items: center;
`

export const SocketBadge = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${({ color }) => color};
`

export const PoolInformationSection = styled.div`
  ${flexColumn};
  padding: 24px;
  gap: 24px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const PoolInfoTitle = styled.div`
  ${flexColumn};
  font-weight: 800;
  font-style: ExtraBold;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 11%;
  text-transform: uppercase;
`

export const PoolInfoFields = styled.div`
  ${flexColumn};
  gap: 16px;
`

export const PoolInfoField = styled.div`
  ${flexColumn};
  gap: 6px;
`

export const PoolInfoFieldTitle = styled.div`
  line-height: 14px;
`

export const PoolInfoFieldValue = styled.div`
  font-size: 14px;
  line-height: 14px;
  color: ${COLOR.WHITE};
`
