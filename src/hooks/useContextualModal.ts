import { useState } from 'react'

interface UseContextualModalParams {
  onOpen?: VoidFunction
  onClose?: VoidFunction
}

export const useContextualModal = ({ onOpen, onClose }: UseContextualModalParams = {}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [subject, setSubject] = useState<unknown>(null)

  const handleOpen = (sub: unknown) => {
    if (sub) {
      setSubject(sub)
    }
    setModalOpen(true)
    onOpen?.()
  }

  const handleClose = () => {
    setSubject(null)
    setModalOpen(false)
    onClose?.()
  }

  return {
    modalOpen,
    handleClose,
    handleOpen,
    subject,
    setSubject,
  }
}
