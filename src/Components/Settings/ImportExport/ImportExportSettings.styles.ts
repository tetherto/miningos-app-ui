import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../app/mixins'
import { COLOR } from '../../../constants/colors'

export const ImportExportContainer = styled.div`
  ${flexColumn};
  gap: 24px;
  padding: 10px 0;
`

export const Description = styled.p`
  color: ${COLOR.WHITE_ALPHA_07};
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`

export const ActionsContainer = styled.div`
  ${flexRow};
  gap: 16px;
  flex-wrap: wrap;
`

export const HiddenFileInput = styled.input`
  display: none;
`

export const WarningText = styled.p`
  color: ${COLOR.YELLOW};
  font-size: 13px;
  margin: 8px 0 0 0;
  font-style: italic;
`
