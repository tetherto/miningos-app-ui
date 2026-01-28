import { LoadingOutlined } from '@ant-design/icons'
import { styled } from 'styled-components'

interface StyledProps {
  $minHeight?: string | number
}

import { flexCenterColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const StyledRoot = styled.div<StyledProps>`
  ${flexCenterColumn};
  width: 100%;
  height: 100%;
  min-height: ${(props) => `${props.$minHeight || 400}px`};
  contain: layout;
`

export const StyledSpinnerOutlined = styled(LoadingOutlined)<StyledProps>`
  color: ${COLOR.WHITE};
`
