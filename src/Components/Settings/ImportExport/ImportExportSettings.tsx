import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Modal from 'antd/es/modal'
import { useState } from 'react'

import { notifyError, notifySuccess } from '../../../app/utils/NotificationService'
import { DEFAULT_HEADER_PREFERENCES, HEADER_PREFERENCES_EVENTS } from '../HeaderControls/types'

import { exportSettingsToFile } from './exportUtils'
import {
  ActionsContainer,
  Description,
  ImportExportContainer,
  WarningText,
} from './ImportExportSettings.styles'
import ImportSettingsModal from './ImportSettingsModal'
import { parseSettingsFile } from './importUtils'
import type { SettingsExportData } from './types'

const HEADER_CONTROLS_STORAGE_KEY = 'headerControlsPreferences'

const ImportExportSettings = () => {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pendingImportData, setPendingImportData] = useState<SettingsExportData | null>(null)

  const handleExport = () => {
    try {
      setIsExporting(true)

      // Get header controls from localStorage
      const headerControlsStr = localStorage.getItem(HEADER_CONTROLS_STORAGE_KEY)
      const headerControls = headerControlsStr
        ? JSON.parse(headerControlsStr)
        : DEFAULT_HEADER_PREFERENCES

      const data: SettingsExportData = {
        headerControls,
        timestamp: new Date().toISOString(),
        version: '1.0',
      }

      const filename = exportSettingsToFile(data)
      notifySuccess('Settings exported successfully', `Downloaded as ${filename}`)
    } catch {
      notifyError('Failed to export settings', 'An unexpected error occurred')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    setImportModalOpen(true)
  }

  const handleUploadFile = async (file: File) => {
    try {
      const data = await parseSettingsFile(file)
      setPendingImportData(data)
      setImportModalOpen(false)
      setConfirmModalOpen(true)
    } catch (error) {
      notifyError(
        'Invalid settings file',
        error instanceof Error ? error.message : 'Could not parse settings file',
      )
      throw error
    }
  }

  const handleConfirmImport = () => {
    if (!pendingImportData) return

    setIsImporting(true)
    setConfirmModalOpen(false)

    try {
      // Import header controls to localStorage
      if (pendingImportData.headerControls) {
        localStorage.setItem(
          HEADER_CONTROLS_STORAGE_KEY,
          JSON.stringify(pendingImportData.headerControls),
        )
        // Dispatch event to notify other components
        window.dispatchEvent(new Event(HEADER_PREFERENCES_EVENTS.PREFERENCES_CHANGED))
      }

      notifySuccess('Settings imported successfully', 'All settings have been applied.')
    } catch {
      notifyError('Failed to import settings', 'An unexpected error occurred')
    } finally {
      setIsImporting(false)
      setPendingImportData(null)
    }
  }

  const handleCancelImport = () => {
    setConfirmModalOpen(false)
    setPendingImportData(null)
  }

  return (
    <ImportExportContainer>
      <Description>
        Save or restore all OS-level configuration in JSON format. Export your current settings to
        back them up, or import a previously saved configuration.
      </Description>

      <ActionsContainer>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          loading={isExporting}
          disabled={isImporting}
        >
          Export JSON
        </Button>

        <Button
          icon={<UploadOutlined />}
          onClick={handleImportClick}
          loading={isImporting}
          disabled={isExporting}
        >
          Import JSON
        </Button>
      </ActionsContainer>

      <WarningText>
        Warning: Importing settings will overwrite your current configuration. Make sure to export
        your current settings before importing.
      </WarningText>

      <ImportSettingsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onUpload={handleUploadFile}
      />

      <Modal
        title="Confirm Settings Import"
        open={confirmModalOpen}
        onOk={handleConfirmImport}
        onCancel={handleCancelImport}
        okText="Import"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to import these settings? This will overwrite your current
          configuration.
        </p>
        {pendingImportData && (
          <div>
            <p>
              <strong>Settings to import:</strong>
            </p>
            <ul>
              {pendingImportData.headerControls && <li>Header Controls</li>}
              {pendingImportData.featureFlags && <li>Feature Flags</li>}
              {pendingImportData.timestamp && (
                <li>Exported: {new Date(pendingImportData.timestamp).toLocaleString()}</li>
              )}
            </ul>
          </div>
        )}
      </Modal>
    </ImportExportContainer>
  )
}

export default ImportExportSettings
