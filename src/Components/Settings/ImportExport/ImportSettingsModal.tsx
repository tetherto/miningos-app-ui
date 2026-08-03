import { UploadOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Upload from 'antd/es/upload'
import type { UploadFile } from 'antd/es/upload/interface'
import { useState } from 'react'

import {
  CloseButton,
  ModalBase,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SectionTitle,
  UploadArea,
  UploadHint,
  UploadIcon,
  UploadText,
} from './ImportSettingsModal.styles'

interface ImportSettingsModalProps {
  open: boolean
  onClose: () => void
  onUpload: (file: File) => Promise<void>
}

const ImportSettingsModal = ({ open, onClose, onUpload }: ImportSettingsModalProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  if (!open) return null

  const handleUpload = async () => {
    if (fileList.length === 0) return

    setUploading(true)
    try {
      const file = fileList[0].originFileObj as File
      await onUpload(file)
      setFileList([])
      onClose()
    } catch {
      // Upload failed
    } finally {
      setUploading(false)
    }
  }

  const handleBeforeUpload = (file: File) => {
    setFileList([
      {
        uid: file.name,
        name: file.name,
        status: 'done',
        originFileObj: file,
      } as UploadFile,
    ])
    return false
  }

  const handleRemove = () => {
    setFileList([])
  }

  return (
    <ModalBase onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Import OS Settings</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <SectionTitle>Upload Configuration File</SectionTitle>

          <Upload.Dragger
            fileList={fileList}
            beforeUpload={handleBeforeUpload}
            onRemove={handleRemove}
            accept=".json,.csv"
            maxCount={1}
            showUploadList={{
              showRemoveIcon: true,
            }}
          >
            <UploadArea>
              <UploadIcon>
                <UploadOutlined />
              </UploadIcon>
              <UploadText>Choose a file or drag & drop it here</UploadText>
              <UploadHint>Accepted formats: .json, .csv</UploadHint>
            </UploadArea>
          </Upload.Dragger>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={fileList.length === 0}
          >
            Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalBase>
  )
}

export default ImportSettingsModal
