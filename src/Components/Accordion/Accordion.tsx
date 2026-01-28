import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { isBoolean as _isBoolean, isFunction as _isFunction } from 'lodash'
import { PropsWithChildren, useState, useEffect } from 'react'

import {
  AccordionContainer,
  AccordionHeader,
  AccordionContent,
  AccordionToggler,
} from './Accordion.styles'

interface AccordionProps {
  title?: string
  isRow?: boolean
  isOpened?: boolean
  unpadded?: boolean
  noBorder?: boolean
  solidBackground?: boolean
  onAccordionToggle?: (opened: boolean) => void
}

const Accordion = ({
  title = '',
  children,
  isRow = false,
  isOpened,
  unpadded = false,
  noBorder = false,
  solidBackground = false,
  onAccordionToggle,
}: PropsWithChildren<AccordionProps>) => {
  const isControlled = _isBoolean(isOpened) && _isFunction(onAccordionToggle)
  const [internalOpen, setInternalOpen] = useState(isOpened ?? false)

  useEffect(() => {
    if (!isControlled && isOpened !== undefined) {
      setInternalOpen(isOpened)
    }
  }, [isOpened, isControlled])

  const open = isControlled ? isOpened : internalOpen

  const toggleAccordion = () => {
    if (isControlled) {
      onAccordionToggle(!isOpened)
    } else {
      setInternalOpen(!internalOpen)
    }
  }

  const TogglerIcon = open ? MinusOutlined : PlusOutlined

  return (
    <AccordionContainer $open={open} $solidBackground={solidBackground}>
      <AccordionHeader onClick={toggleAccordion} $noBorder={noBorder}>
        {title}
        <AccordionToggler>
          <TogglerIcon />
        </AccordionToggler>
      </AccordionHeader>
      {open && children && (
        <AccordionContent $row={isRow} $noPadding={unpadded}>
          {children}
        </AccordionContent>
      )}
    </AccordionContainer>
  )
}

export default Accordion
