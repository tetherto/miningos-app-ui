import styled from 'styled-components'

import { flexCenter, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const ExplorerViewRow = styled.div<{ $isMinerTab: boolean }>`
  ${flexRow};
  background-color: ${COLOR.DARK};
  width: 100%;
  align-items: flex-start;
  margin-top: 20px;
  ${(props) => (!props.$isMinerTab ? 'height: calc(100vh - 145px);' : 'height: 100%;')};

  @media (max-width: 992px) {
    height: 100%;
    flex-direction: column;
  }

  @media (min-width: 1440px) {
    ${(props) => (!props.$isMinerTab ? 'height: calc(100vh - 95px) !important;' : '')}
  }
`

export const MainExplorerView = styled.div`
  padding: 20px;
  min-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
`

export const ExplorerCol = styled.div<{ $hasSelection?: boolean }>`
  padding: 20px;
  padding-top: 0;
  box-sizing: border-box;
  background: ${COLOR.EBONY};
  height: calc(100vh - 145px);
  width: ${(props) => (props.$hasSelection ? '70%' : '100%')};
  border-right: ${(props) => (props.$hasSelection ? `1px solid ${COLOR.DARKER_GREY}` : 'none')};

  @media (max-width: 992px) {
    max-width: 100%;
    width: 100%;
    flex: 1;
    padding: 0;
  }

  @media (min-width: 1440px) {
    height: calc(100vh - 95px) !important;
  }
`
export const StickyExplorerCol = styled(ExplorerCol)`
  position: sticky;
  top: 0;
  overflow-y: auto;
  max-width: 30%;
  min-width: 300px;
`

export const DetailsExplorerCol = styled.div`
  ${flexCenter};
  flex-direction: column;
  position: fixed;
  bottom: 70px;
  z-index: 1;
  background-color: ${COLOR.COLD_ORANGE};
  width: 70px;
  height: 70px;
  padding: 8px;
  text-align: center;
  border-radius: 100%;
  right: 10px;
  bottom: 10px;
  cursor: pointer;
  font-size: 12px;
`

export const HeaderWrapper = styled.div`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
`

export const ErrorBannerWrapper = styled.div`
  margin: 12px;
`
