import { FC } from 'react'

import { ControlBox } from '../ControlBox/ControlBox'
import { StartedOption } from '../ControlBox/ControlBox.styles'

interface CompactUnitControlBoxProps {
  title?: string
  opening?: unknown
  closing?: unknown
  isOpen?: boolean
}

const CompactUnitControlBox: FC<CompactUnitControlBoxProps> = ({
  title,
  opening,
  closing,
  isOpen,
}) => (
  <ControlBox
    secondary
    title={title}
    rightContent={
      <>
        <StartedOption>{isOpen ? 'Open' : 'Closed'}</StartedOption>
        {opening && <StartedOption>Opening</StartedOption>}
        {closing && <StartedOption>Closing</StartedOption>}
      </>
    }
  />
)

export { CompactUnitControlBox }
