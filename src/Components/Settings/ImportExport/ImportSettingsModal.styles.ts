import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const ModalBase = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${COLOR.BLACK_ALPHA_07};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

export const ModalContent = styled.div`
  background: ${COLOR.DARK_GRAY};
  border: 1px solid ${COLOR.MEDIUM_GRAY};
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
`

export const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${COLOR.MEDIUM_GRAY};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const ModalTitle = styled.h3`
  margin: 0;
  color: ${COLOR.WHITE};
  font-size: 18px;
  font-weight: 600;
`

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${COLOR.TEXT_GRAY};
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${COLOR.WHITE};
  }
`

export const ModalBody = styled.div`
  padding: 24px;
`

export const SectionTitle = styled.h4`
  color: ${COLOR.WHITE};
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
`

export const UploadArea = styled.div`
  border: 2px dashed ${COLOR.LIGHT_DARK_GRAY};
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  background: ${COLOR.EBONY};
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: ${COLOR.COLD_ORANGE};
    background: ${COLOR.ORANGE_DARK_BG};
  }

  .ant-upload {
    width: 100%;
  }
`

export const UploadIcon = styled.div`
  color: ${COLOR.TEXT_GRAY};
  font-size: 32px;
  margin-bottom: 16px;
`

export const UploadText = styled.div`
  color: ${COLOR.WHITE};
  font-size: 14px;
  margin-bottom: 8px;
`

export const UploadHint = styled.div`
  color: ${COLOR.TEXT_GRAY};
  font-size: 12px;
`

export const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${COLOR.MEDIUM_GRAY};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`
