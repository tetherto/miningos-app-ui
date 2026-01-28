import styled from 'styled-components'

import { flexCenterRow, flexColumn, flexAlign } from '../../app/mixins'
import { COLOR } from '../../constants/colors'

export const ActionsWrapper = styled.div`
  ${flexAlign};
  margin-inline: 16px;
  flex-shrink: 0;
  white-space: nowrap;
  min-height: 32px;
  contain: layout;

  @media (max-width: 768px) {
    margin-inline: 10px;
    min-height: 28px;
  }
`

export const IconsWrapper = styled.div`
  ${flexAlign};
  gap: 16px;
  width: 227px;

  .anticon {
    display: block;
    color: ${COLOR.EMERALD};
    font-size: 32px;

    &:hover {
      cursor: pointer;
    }
  }

  @media (min-width: 768px) {
    margin-inline: 20px;
    width: 187px;

    & > .anticon {
      display: none;
    }
  }
`

export const HeaderWrapper = styled.div`
  ${flexColumn};
  justify-content: space-between;
  gap: 12px;
  position: sticky;
  top: 0;
  background-color: ${COLOR.EBONY};
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  z-index: 8;

  @media (max-width: 768px) {
    padding-inline: 5px;

    > span {
      display: none;
    }
  }
`

export const HeaderTopRow = styled.div`
  ${flexAlign};
  width: 100%;
  min-height: 76px;
  position: fixed;
  background-color: ${COLOR.EBONY};
  border-bottom: 0.5px solid ${COLOR.COLD_ORANGE};
  top: 0;
  left: 0;
  right: 0;
  padding-inline: 5px;
`

export const StatsWrapper = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const HeaderButtonWrapper = styled.div`
  ${flexCenterRow};
  position: relative;
  background-color: ${COLOR.COLD_ORANGE};
  width: 45px;
  height: 45px;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    z-index: 1;
  }

  &::before {
    top: 0;
    left: 0;
    border-style: solid;
    border-width: 8px 8px 0 0;
    border-color: ${COLOR.BLACK} transparent transparent transparent;
  }

  &::after {
    bottom: 0;
    right: 0;
    border-style: solid;
    border-width: 0 0 8px 8px;
    border-color: transparent transparent ${COLOR.BLACK} transparent;
  }

  @media (min-width: 768px) {
    border: none;

    &:hover {
      transform: none;
    }
  }
`

export const EmailWrapper = styled.div`
  display: flex;
  color: ${COLOR.WHITE};
`

export const UserInfoWrapper = styled.div`
  ${flexAlign};
  opacity: 0.9;
  cursor: help;
  justify-content: between;
  gap: 8px;
`

export const TimezoneLabelOuterContainer = styled.div`
  ${flexColumn};
`
export const TimezoneLableCurrentTimezone = styled.div`
  font-size: 12px;
`
export const TimezoneIconContainer = styled.div`
  font-size: 15px !important;
  margin-left: 2px !important;
  margin-right: 2px !important;
`

export const LogoWrapper = styled.div`
  ${flexCenterRow};
  max-width: 180px;
  flex: 1;
`
