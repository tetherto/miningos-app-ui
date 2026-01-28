import styled, { css } from 'styled-components'

import { flexCenterRow, flexRow } from '@/app/mixins/index'
import { COLOR } from '@/constants/colors'

type PinnedProps = {
  $isPinned?: boolean
}

export const LayoutRoot = styled.div<{ $frozen?: boolean }>`
  height: 100%;
  ${(props) =>
    props.$frozen &&
    css`
      &,
      & * {
        pointer-events: none !important;
        overflow: hidden !important;
      }
    `}
`

export const MainWrapper = styled.main`
  ${flexRow};
  height: calc(100% - 78px);
  margin-top: 77px;
  background: ${COLOR.EBONY};
  position: relative;
`

export const OutletContainer = styled.div<PinnedProps>`
  ${(props) => (props.$isPinned ? 'flex: 3; overflow-y: hidden;' : '')}
  height: 100%;
`

export const ActionsSidebarContainer = styled.div<PinnedProps>`
  ${(props) => (props.$isPinned ? 'flex: 1;padding: 10px 0 0 10px;' : '')}
`

export const ContentOutletContainer = styled.div<PinnedProps>`
  ${(props) => (props.$isPinned ? 'display: flex; flex-direction: row; height: 100%;' : '')};
  padding: 0 10px;
  background: ${COLOR.EBONY};
  max-height: fit-content;
  position: relative;
  min-height: calc(100vh - 78px);
  z-index: 1;
`

export const Content = styled.div<{ $isExpanded?: boolean }>`
  flex: 1;
  transition: all 0.1s ease-in-out;
  width: ${({ $isExpanded }) => `calc(100dvw - ${$isExpanded ? '240px' : '70px'})`};
  background-color: ${COLOR.EBONY};
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    margin: ${({ $isExpanded }) => `0 0 0  ${$isExpanded ? '221px' : '66px'}`};
  }

  // query for mobile
  @media (max-width: 768px) {
    padding: 0;
  }
`

export const LocationRestrictedOverlay = styled.div<PinnedProps>`
  ${flexCenterRow};
  flex-wrap: wrap;
  align-content: center;
  text-align: center;
  box-sizing: border-box;
  position: fixed;
  z-index: 99999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: ${COLOR.BLACK};
`
