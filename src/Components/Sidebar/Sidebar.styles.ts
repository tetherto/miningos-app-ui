import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

interface StyledProps {
  $isExpanded?: boolean
  $showSidebar?: boolean
  $showButton?: boolean
}

import { flexCenterRow, flexColumn } from '../../app/mixins'
import { COLOR } from '../../constants/colors'

const rectSize = 20
const borderWidth = 0.5

export const SidebarContainer = styled.div<StyledProps>`
  background: ${COLOR.EBONY};
  width: ${(props) => (props.$isExpanded ? '220px' : '65px')};
  align-items: center;
  border-right: ${(props) =>
    props.$showSidebar ? `${borderWidth}px solid ${COLOR.COLD_ORANGE}` : 'none'};
  position: fixed;
  top: 75px;
  bottom: 0;
  padding-top: 20px;
  z-index: 10;
  left: ${({ $showSidebar }) => ($showSidebar ? '0' : '-220px')};
  transition:
    left 0.3s ease-in-out,
    width 0.3s ease-in-out;
  ${flexColumn};
  -ms-overflow-style: none;
  scrollbar-width: none;

  &:after {
    content: '';
    position: absolute;
    top: -9px;
    right: -10px;
    width: ${rectSize + borderWidth}px;
    height: ${rectSize}px;
    transform: rotate(45deg);
    background: ${COLOR.EBONY};
    clip-path: polygon(0 0, 100% 0, 100% 100%);
    border-right: ${borderWidth}px solid ${COLOR.COLD_ORANGE};
    display: ${(props) => (props.$showSidebar ? 'block' : 'none')};

    @media (min-width: 768px) {
      display: block;
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }

  > .anticon {
    color: var(--miningos-brown-1);
    font-size: 32px;
    margin-top: 17px;
    &:hover {
      cursor: pointer;
    }
  }

  @media (min-width: 768px) {
    left: 0;
    border-right: ${borderWidth}px solid ${COLOR.COLD_ORANGE};
  }
`

export const ExpandBtnContainer = styled.div<StyledProps>`
  ${flexCenterRow};
  cursor: pointer;
  position: fixed;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.COLD_ORANGE};
  border-radius: 50%;
  height: 25px;
  width: 25px;
  top: 117px;
  left: ${({ $isExpanded, $showButton }) => {
    if (!$showButton) return '-300px'
    return $isExpanded ? '208px' : '52px'
  }};
  transition: left 0.3s ease-in-out;
  font-size: 13px;
`

export const MenuItems = styled.div<StyledProps>`
  ${flexColumn};
  align-items: center;
  gap: 2px;
  flex: 1;
  width: 100%;
  padding: 0 10px;
  user-select: none;
  box-sizing: border-box;
  animation: fadeIn 0.3s ease-in;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

export const Link = styled(NavLink)<StyledProps>`
  text-decoration: none;
  color: inherit;
  ${flexCenterRow};
`
