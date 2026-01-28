import Table from 'antd/es/table'
import styled, { css } from 'styled-components'

import { COLOR } from '@/constants/colors'

interface StyledProps {
  $isEmpty?: boolean
}

export const StyledTable = styled(Table)<StyledProps>`
  .ant-table {
    overflow-x: unset !important;
    border: 1px solid ${COLOR.WHITE_ALPHA_01};
    border-radius: 0;

    & * {
      border-radius: 0;
    }
  }

  .ant-table-cell::before {
    width: 0 !important;
  }

  ${({ $isEmpty }) =>
    $isEmpty &&
    css`
      .ant-table-cell {
        width: 160px !important;

        &:nth-child(1) {
          width: 70px !important;
        }
      }
    `}

  .ant-table-container * {
    border-radius: 0 !important;
  }

  .ant-table-container {
    overflow-x: auto !important;
  }

  .ant-table-thead > tr > th {
    background-color: ${COLOR.BLACK};
    position: relative;
    padding: 10px;
    color: ${COLOR.WHITE_ALPHA_05};
    font-size: 12px;

    /* Sorter icon styles */
    div > span.ant-table-column-sorter > span {
      /* hide not active sorters */
      span:not(.active) {
        display: none !important;
      }

      span.anticon-caret-down {
        margin-top: 3px;
      }

      span > svg {
        fill: ${COLOR.COLD_ORANGE};
      }
    }
  }

  .ant-table-tbody > tr > td {
    background-color: transparent;
  }

  .ant-table-tbody > tr {
    contain: layout;
    min-height: 48px;
  }

  .ant-table-thead > tr {
    border: 1px solid ${COLOR.WHITE_ALPHA_02};
  }

  .ant-table-body {
    max-height: calc(100vh - 400px) !important;
    ${({ $isEmpty }) => $isEmpty && 'overflow: hidden !important;'}
  }

  .ant-pagination-prev,
  .ant-pagination-next {
    border: 1px solid ${COLOR.WHITE_ALPHA_02};
    border-radius: 0;
  }

  .ant-pagination-item {
    border-radius: 0;
    border: 1px solid ${COLOR.WHITE_ALPHA_02};

    a {
      color: ${COLOR.COLD_ORANGE};
      border: none;
    }

    a:hover {
      color: ${COLOR.WHITE_ALPHA_08};
      background-color: ${COLOR.ALPHA_COLD_ORANGE_08};
    }
  }

  .ant-pagination-item-active {
    background-color: ${COLOR.COLD_ORANGE_ALPHA_02};
    border: none;
  }

  .ant-table-empty {
    overflow-x: hidden !important;
  }
`
