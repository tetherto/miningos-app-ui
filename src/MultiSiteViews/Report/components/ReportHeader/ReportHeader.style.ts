import styled from 'styled-components'

import { flexAlign, flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const HeaderWrapper = styled.header`
  background-color: ${COLOR.BLACK_ALPHA_05};
  padding: 12px;
  color: ${COLOR.FROST_GRAY};
  position: relative;
  font-family: sans-serif;
  font-size: 14px;

  @media (min-width: 480px) {
    padding: 16px;
  }

  @media (min-width: 768px) {
    padding: 16px 24px;
  }
`

export const HeaderContent = styled.div`
  ${flexColumn};
  gap: 8px;
  padding: 8px 0;
  align-items: center;
  justify-content: space-between;

  @media (min-width: 481px) {
    gap: 12px;
    padding: 12px 0;
  }

  @media (min-width: 769px) {
    gap: 16px;
    padding: 16px 0;
  }

  @media (min-width: 969px) {
    flex-direction: row;
    align-items: center;
  }
`

export const LogoContainer = styled.div`
  ${flexAlign};
  gap: 12px;
`

export const LogoIconWrapper = styled.div`
  ${flexAlign};
  padding: 8px;
  border-radius: 50%;
  justify-content: center;
  background-color: ${COLOR.DARK_CHOCOLATE};
`

export const LogoText = styled.span`
  font-size: 20px;
  font-weight: 600;
`

export const TitleContainer = styled.div`
  text-align: center;

  @media (max-width: 968px) {
    order: -1;
  }
`

export const MainTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    line-height: 1.2;
  }
`

export const SubTitle = styled.p`
  font-size: 14px;
  color: ${COLOR.SLATE_GRAY};
  margin: 4px 0 0 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin: 2px 0 0 0;
  }
`

export const PriceContainer = styled.div`
  ${flexAlign};
  gap: 8px;
  background-color: ${COLOR.JET_BLACK};
  padding: 8px 16px;
  border-radius: 6px;

  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 6px 8px;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }
`

export const PriceText = styled.span`
  font-size: 14px;
  color: ${COLOR.SLATE_GRAY};

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`

export const PriceValue = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${COLOR.ORANGE_WARNING};

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`

export const BottomBorder = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: ${COLOR.ORANGE_BORDER}};
`
