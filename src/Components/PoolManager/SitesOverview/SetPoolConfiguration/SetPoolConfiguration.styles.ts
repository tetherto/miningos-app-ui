import Button from 'antd/es/button'
import Table from 'antd/es/table'
import Typography from 'antd/es/typography'
import styled, { css } from 'styled-components'

const Title = Typography.Title

interface StyledProps {
  $primary?: unknown
  $hasBorderBottom?: unknown
}

import { flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const Wrapper = styled.div<StyledProps>`
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const Container = styled.div<StyledProps>`
  padding: 24px;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const StyledTitle = styled(Title)<StyledProps>`
  color: ${COLOR.WHITE};
  margin-bottom: 20px;
  margin-top: 0;
`

export const Section = styled.div<StyledProps>`
  margin-bottom: 24px;
`

export const Label = styled.div<StyledProps>`
  color: ${COLOR.WHITE};
  margin: 20px 0 10px;
  font-size: 14px;
  text-transform: uppercase;
`

export const InfoRow = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
  margin-top: 10px;
`

export const SubTitle = styled.div<StyledProps>`
  color: ${COLOR.WHITE_ALPHA_05};
  font-size: 12px;
  font-weight: bolder;
  text-transform: uppercase;
  margin-bottom: 8px;
`

export const StyledTable = styled(Table)<StyledProps>`
  background: transparent;

  .ant-table {
    background: transparent;
    border: 1px solid ${COLOR.WHITE_ALPHA_01};
    padding: 5px;
    border-radius: 0px;
  }

  .ant-table-thead > tr > th {
    background: transparent;
    color: ${COLOR.WHITE_ALPHA_05};
    font-weight: 400;
    border-bottom: unset;
    &::before {
      content: unset !important;
    }
  }

  .ant-table-tbody > tr > td {
    border-bottom: unset;
    color: ${COLOR.WHITE};
  }
`

export const RoleTag = styled.span<StyledProps>`
  color: ${({ $primary }) => ($primary ? COLOR.COLD_ORANGE : COLOR.LIGHT)};
  background-color: ${({ $primary }) => ($primary ? COLOR.COLD_ORANGE : COLOR.LIGHT)}1A;
  font-size: 12px;
  padding: 2px 8px;
  text-transform: uppercase;
`

export const Credentials = styled.div<StyledProps>`
  font-size: 12px;
  line-height: 1.4;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 10px;
  font-weight: 400;
`

export const CredentialsRow = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
  margin-top: 7px;
  ${({ $hasBorderBottom }: StyledProps) =>
    $hasBorderBottom
      ? css<StyledProps>`
          border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
          padding-bottom: 10px;
        `
      : ''}
`

export const CredentialLabel = styled.span<StyledProps>`
  color: ${COLOR.WHITE_ALPHA_05};
`

export const CredentialUnit = styled.span<StyledProps>`
  color: ${COLOR.WHITE};
`

export const Example = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
  margin-top: 10px;
`

export const ExampleValue = styled.span<StyledProps>`
  color: ${COLOR.COLD_ORANGE};
`

export const StyledButton = styled(Button)<StyledProps>`
  color: ${COLOR.SIMPLE_BLACK};
  background-color: ${COLOR.COLD_ORANGE};
  padding: 20px;
`

export const ButtonContainer = styled.div<StyledProps>`
  margin: 24px;
`
