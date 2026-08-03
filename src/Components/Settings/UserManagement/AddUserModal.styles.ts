import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

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

export const FullWidthSelect = styled.div`
  width: 100%;
`
