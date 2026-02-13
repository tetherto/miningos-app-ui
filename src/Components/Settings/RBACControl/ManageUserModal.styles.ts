import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const SectionContainer = styled.div`
  margin-bottom: 24px;
`

export const SectionTitle = styled.h4`
  color: ${COLOR.WHITE};
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
`

export const SectionDescription = styled.div`
  color: ${COLOR.TEXT_GRAY};
  font-size: 12px;
  margin-bottom: 16px;
`

export const FieldContainer = styled.div`
  margin-bottom: 16px;
`

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${COLOR.LABEL_GRAY};
  font-size: 14px;
`

export const HelperText = styled.div`
  margin-top: 8px;
  color: ${COLOR.TEXT_GRAY};
  font-size: 12px;
`

export const PermissionsTable = styled.div`
  border: 1px solid ${COLOR.MEDIUM_GRAY};
  border-radius: 4px;
  overflow: hidden;
`

export const PermissionsTableHeader = styled.div`
  display: flex;
  padding: 12px 16px;
  background-color: ${COLOR.DARK_GRAY};
  border-bottom: 1px solid ${COLOR.MEDIUM_GRAY};
`

export const PermissionsTableHeaderCell = styled.div<{
  $flex?: number
  $width?: string
  $align?: string
}>`
  flex: ${({ $flex }) => $flex || 1};
  width: ${({ $width }) => $width || 'auto'};
  color: ${COLOR.LABEL_GRAY};
  font-size: 12px;
  font-weight: 600;
  text-align: ${({ $align }) => $align || 'left'};
`

export const PermissionsTableRow = styled.div`
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid ${COLOR.MEDIUM_GRAY};
  align-items: center;
`

export const PermissionsTableCell = styled.div<{
  $flex?: number
  $width?: string
  $align?: string
}>`
  flex: ${({ $flex }) => $flex || 1};
  width: ${({ $width }) => $width || 'auto'};
  color: ${COLOR.WHITE};
  font-size: 14px;
  text-align: ${({ $align }) => $align || 'left'};
`

export const IconWrapper = styled.div<{ $width?: string; $align?: string }>`
  width: ${({ $width }) => $width || '80px'};
  text-align: ${({ $align }) => $align || 'center'};
`

export const CheckIconWrapper = styled.div`
  color: ${COLOR.LIGHT_GREEN};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`

export const ReadOnlyIconWrapper = styled.div`
  color: ${COLOR.COLD_ORANGE};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`

export const CloseIconWrapper = styled.div`
  color: ${COLOR.BRIGHT_RED};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`

export const FullWidthSelect = styled.div`
  width: 100%;
`
