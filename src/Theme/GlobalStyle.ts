import { createGlobalStyle } from 'styled-components'

import { COLOR } from '@/constants/colors'

// ✅ Explicitly type the styled-component so it's recognized as a styled-component global style
export const GlobalStyle = createGlobalStyle`
  @border-radius-base: 0;
  @border-radius-sm: 0;
  @border-radius-lg: 0;

  * {
    font-family: 'JetBrains Mono', sans-serif !important;
  }

  body {
    color: ${COLOR.WHITE};
  }

  ::-webkit-scrollbar {
    background-color: transparent;
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background-color: ${COLOR.BLACK};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${COLOR.COLD_ORANGE};
    border-radius: 3px;

    &:hover {
      background-color: ${COLOR.ALPHA_COLD_ORANGE_08};
    }
  }

  html, body, #root {
    padding: 0;
    margin: 0;
    background-color: ${COLOR.BLACK};
    transition: background-color 0.1s, color 0.1s;
    height: 100%;
  }

  img, video, iframe {
    max-width: 100%;
    height: auto;
  }

  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root.non-interactive {
    pointer-events: none;
  }

  .ant-picker-date-panel-container > .ant-modal-root,
  .ant-picker-date-panel-container > .ant-modal-root > .ant-modal-wrap {
    overflow: hidden !important;
    background: none !important;
    background-color: none !important;

    > .ant-modal {
      padding-bottom: 0 !important;
    }
  }

  .ant-picker-date-range-wrapper > .ant-picker-range-arrow {
    display: none !important;
  }

  textarea:focus,
  input:focus {
    outline: none;
  }

  p {
    margin: 0;
    padding: 0;
  }

  div,
  span,
  input,
  textarea,
  button,
  select,
  a {
    -webkit-tap-highlight-color: transparent;
  }

  .ant-tag {
    color: ${COLOR.WHITE} !important;
    background-color: ${COLOR.COLD_ORANGE};
    border: none;
    border-radius: 0;
    text-align: center;
  }

  .ant-tag .ant-tag-close-icon {
    color: ${COLOR.WHITE} !important;
  }

  .ant-dropdown-menu {
    background-color: ${COLOR.BLACK} !important;
    border-radius: 0 !important;
  }

  .ant-dropdown-menu-item:hover {
    background-color: ${COLOR.COLD_ORANGE} !important;
  }

  .ant-dropdown-menu-item {
    color: ${COLOR.LIGHT} !important;
    border-radius: 0 !important;
  }

  .header-dropdown-overlay .ant-dropdown-menu,
  .header-dropdown {
    .ant-dropdown-menu-item {
      padding: 15px 14px;
    }

    .ant-dropdown-menu-title-content {
      padding-left: 12px;
    }
  }

  .ant-picker,
  .ant-picker-panel-container {
    border-radius: 0 !important;
  }

  .header-dropdown-overlay.limited-height > ul {
    max-height: 500px;
    overflow-y: auto;
  }

  .header-dropdown-overlay.pending-actions {
    ul, li {
      padding: 0 !important;

      > span {
        padding: 0 !important;
      }
    }
  }

  .ant-dropdown-menu-item-group-title {
    color: ${COLOR.DARK_GREY} !important;
  }

  .ant-btn {
    background-color: ${COLOR.BLACK};
    border-radius: 0;
  }

  .ant-btn.ant-btn-link {
    color: var(--miningos-link-color);
  }

  .ant-btn-primary {
    color: ${COLOR.WHITE} !important;
    background-color: ${COLOR.COLD_ORANGE} !important;
    border-radius: 0;
  }

  .ant-radio-button-wrapper {
    background-color: ${COLOR.BLACK} !important;
    color: ${COLOR.LIGHT} !important;
  }

  .ant-radio-button-wrapper-checked {
    color: ${COLOR.COLD_ORANGE} !important;
  }

  .ant-dropdown-menu-item-selected,
  .ant-dropdown-menu-item-active {
    background-color: ${COLOR.COLD_ORANGE} !important;
  }

  .ant-modal-content {
    border: 1px solid ${COLOR.WHITE_ALPHA_01} !important;
    background-color: ${COLOR.SIMPLE_BLACK} !important;
  }

  .ant-modal-header {
    padding-bottom: 28px;
    background-color: ${COLOR.SIMPLE_BLACK};
    border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  }

  .ant-modal-body {
    margin-top: 16px;
  }

  @media (max-width: 767px) {
    .header-dropdown.ant-dropdown-trigger {
      padding: 0;
      background: none;
      border: none;
      box-shadow: none;

      &:hover {
        background-color: transparent !important;
      }
    }
  }

  .ant-dropdown-menu-submenu-title {
    padding-inline-end: 5px !important;

    &:hover {
      background-color: ${COLOR.COLD_ORANGE} !important;
    }
  }

  .ant-tooltip-inner {
    max-height: 400px;
    overflow-y: auto;
  }

  .infinite-viewer-scroll-thumb {
    background: ${COLOR.COLD_ORANGE} !important;
  }

  .ant-popover.mos-popover .ant-popover-content > .ant-popover-inner {
    padding: 0;
    background: ${COLOR.BLACK};
  }

  .ant-empty-description {
    color: ${COLOR.WHITE_ALPHA_07} !important;
  }

  .ant-select-dropdown {
    min-width: 200px !important;
  }

  .ant-select-item-option-content {
    white-space: nowrap;
    overflow: visible;
  }
`
