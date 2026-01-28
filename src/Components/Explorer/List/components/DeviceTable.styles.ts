import styled from 'styled-components'

// Wrapper that makes radio buttons pass clicks through to the row
export const CabinetTableWrapper = styled.div`
  .ant-table-selection-column .ant-radio-wrapper {
    pointer-events: none;
  }

  .ant-table-tbody > tr {
    cursor: pointer;
  }
`
