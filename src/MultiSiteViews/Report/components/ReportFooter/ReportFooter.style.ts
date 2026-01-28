import styled from 'styled-components'

import { flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const FooterWrapper = styled.footer`
  background-color: ${COLOR.BLACK_ALPHA_05};
  padding: 10px;
  color: ${COLOR.SLATE_GRAY};
  position: relative;
  font-family: sans-serif;
  font-size: 12px;
  margin-top: auto;

  @media (min-width: 480px) {
    padding: 12px 16px;
  }

  @media (min-width: 768px) {
    padding: 12px 24px;
  }
`

export const TopBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: ${COLOR.GRAY};
`

export const FooterContent = styled.div`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`

export const FooterText = styled.span`
  font-size: 12px;
  color: ${COLOR.GRAY};
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`

export const TimezoneText = styled(FooterText)`
  font-weight: 500;
`

export const ConfidentialText = styled(FooterText)`
  color: ${COLOR.GRAY};
`
