import styled from 'styled-components'

import { flexCenter, flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const CoverWrapper = styled.div`
  ${flexColumn};
  background-color: ${COLOR.DARK_BLACK};
  border-radius: 0 12px 12px 12px;
  padding: 3rem;
  position: relative;
  overflow: hidden;
  min-height: 700px;
  font-family: sans-serif;
  max-width: 100%;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 20px;
    bottom: 20px;
    border-radius: 12px;
    pointer-events: none;
  }

  @media (max-width: 640px) {
    padding: 2rem;
  }
`

export const StyledBackground = styled.picture`
  position: absolute;
  top: 24%;
  right: 0%;
  z-index: 0;
  pointer-events: none;

  img {
    display: block;
  }
`

export const ContentWrapper = styled.div<{ $isFront: boolean }>`
  ${flexColumn};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  height: 86%;
  width: 97%;
  justify-content: ${(p) => (p.$isFront ? 'start' : 'center')};
  align-items: ${(p) => (p.$isFront ? 'stretch' : 'center')};

  background: rgba(17, 17, 17, 0.25);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 8px;
  border: 1px solid ${COLOR.ORANGE_BORDER};
`

export const LogoCorner = styled.div`
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 2; /* above background & glass panel contents */
  display: inline-flex;
  align-items: center;

  /* optional: scale the SVG predictably */
  & > svg {
    display: block;
    height: 36px;
    width: auto;
  }

  @media (max-width: 640px) {
    top: 1rem;
    left: 1rem;
    & > svg {
      height: 28px;
    }
  }
`

export const Content = styled.div<{ $isFront: boolean }>`
  ${flexColumn};
  gap: 2px;
  margin-top: ${(p) => (p.$isFront ? '6rem' : '0')};
  padding: ${(p) => (p.$isFront ? '2rem 4rem' : '0')};
  text-align: ${(p) => (p.$isFront ? 'left' : 'center')};
  align-items: ${(p) => (p.$isFront ? 'flex-start' : 'center')};
`

export const CoverTitle = styled.h1<{ $center?: boolean }>`
  font-size: 60px;
  font-weight: 700;
  color: ${COLOR.FROST_GRAY};
  letter-spacing: -0.025em;
  margin: 0;
  text-align: ${(p) => (p.$center ? 'center' : 'left')};

  @media (max-width: 640px) {
    font-size: 2.25rem;
  }
`

export const CoverSubtitle = styled.h4`
  font-size: 60px;
  font-weight: 300;
  color: ${COLOR.SLATE_GRAY};
  margin-top: 0.75rem;
  margin-bottom: 0;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`

export const LoadingWrapper = styled.div`
  ${flexCenter};

  flex: 1;
`
