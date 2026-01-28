import _noop from 'lodash/noop'

import {
  EditFlowHeaderContainer,
  EditFlowHeaderTextContainer,
  PduTabHeaderIconContainer,
} from './PduTab.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import useDeviceResolution from '@/hooks/useDeviceResolution'

interface EditFlowHeaderProps {
  isEditFlow?: boolean
  headerText?: string
  onMobileSelectionToggle?: () => void
  onCancelClicked?: () => void
  onEditClicked?: () => void
  connectedMiners?: UnknownRecord[]
}

const EditFlowHeader = ({
  isEditFlow = false,
  headerText = '',
  onMobileSelectionToggle = _noop,
}: EditFlowHeaderProps) => {
  const { isTablet } = useDeviceResolution()

  return (
    <EditFlowHeaderContainer>
      {isTablet && (
        <PduTabHeaderIconContainer onClick={onMobileSelectionToggle}>
          Toggle Select Mode
        </PduTabHeaderIconContainer>
      )}
      <EditFlowHeaderTextContainer>{isEditFlow && headerText}</EditFlowHeaderTextContainer>
    </EditFlowHeaderContainer>
  )
}

export default EditFlowHeader
