import { QuestionCircleOutlined } from '@ant-design/icons'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import _head from 'lodash/head'
import { useDispatch } from 'react-redux'

import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import FeatureFlagsSettings from '../../Components/Settings/FeatureFlagsSettings/FeatureFlagsSettings'
import { WEBAPP_NAME } from '../../constants'
import { COLOR } from '../../constants/colors'

import { HeaderTabs, RebootDescription, SettingsContainer, SettingsTitle } from './Settings.styles'

import {
  useGetFeatureConfigQuery,
  useGetGlobalConfigQuery,
  useSetGlobalConfigMutation,
} from '@/app/services/api'
import { actionsSlice } from '@/app/slices/actionsSlice'
import { notifyError, notifySuccess } from '@/app/utils/NotificationService'
import { ConsumptionLevels } from '@/app/utils/statusUtils'
import { DangerActionButton } from '@/Components/DangerActionButton/DangerActionButton'
import { ERROR_CODES } from '@/Components/Settings/UserManagement/constants'
import { ACTION_TYPES } from '@/constants/actions'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '@/constants/permissions.constants'
import { ApiError, FeatureConfigResponse } from '@/types'

const { setAddPendingSubmissionAction } = actionsSlice.actions

const Settings = () => {
  const dispatch = useDispatch()

  const [setGlobalConfig, { isLoading: isSettingGlobalConfig }] = useSetGlobalConfigMutation()
  const { data: globalConfig, isLoading: isLoadingGlobalConfig } = useGetGlobalConfigQuery({
    overwriteCache: true,
  })
  const isAutoSleepAllowed =
    _head(
      globalConfig as
        | Array<{
            consumptionLevels?: ConsumptionLevels
            [key: string]: unknown
          }>
        | undefined,
    )?.isAutoSleepAllowed || null

  const featureConfigQuery = useGetFeatureConfigQuery<FeatureConfigResponse>(undefined)
  const featureConfig = featureConfigQuery.data ?? {}
  const isSettingsEnabled = Boolean(featureConfig.settings)
  const isContainerAutomationControlEnabled = Boolean(featureConfig.containerAutomationControl)

  const rebootWebapp = () => {
    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.RACK_REBOOT,
        tags: [],
        params: [],
      }),
    )
  }

  if (!isSettingsEnabled) {
    return null
  }
  const headerTabItems = [
    {
      label: 'Enable / Disable Features',
      key: 'FEATURE_FLAGS',
      children: <FeatureFlagsSettings />,
    },
  ]

  const settingsReadPermission = `${AUTH_PERMISSIONS.SETTINGS}:${AUTH_LEVELS.READ}`

  const onEnableDisableGlobalConfig = async (isAllowed: boolean) => {
    const { data, error } = await setGlobalConfig({
      data: {
        isAutoSleepAllowed: isAllowed,
      },
    })
    if (data?.success) {
      notifySuccess(`Container automation ${isAllowed ? 'enabled' : 'disabled'}`, '')
    } else {
      notifyError(
        (error as ApiError)?.data?.message
          ? ERROR_CODES[(error as ApiError)?.data?.message as keyof typeof ERROR_CODES]
          : ERROR_CODES.DEFAULT,
        '',
      )
    }
  }

  return (
    <GateKeeper config={{ perm: settingsReadPermission }}>
      <SettingsContainer>
        <SettingsTitle>Settings</SettingsTitle>
        <Row gutter={[12, 12]}>
          <Col>
            <DangerActionButton
              isRed
              label={`Reboot ${WEBAPP_NAME}`}
              confirmation={{
                title: `Reboot ${WEBAPP_NAME}`,
                description: (
                  <RebootDescription>
                    <p>
                      The Reboot feature restarts all the device communication workers. This will
                      help when any one type of device information goes missing in {WEBAPP_NAME}.
                    </p>
                    <p>
                      There should not be any pending actions in the Actions chart when rebooting
                      {WEBAPP_NAME}. Please submit or discard all other pending actions before
                      submitting the request to reboot {WEBAPP_NAME}. This action needs a 2nd
                      approval.
                    </p>
                  </RebootDescription>
                ),
                onConfirm: rebootWebapp,
                icon: <QuestionCircleOutlined style={{ color: COLOR.RED }} />,
              }}
            />
          </Col>
          {isContainerAutomationControlEnabled && (
            <Col>
              <DangerActionButton
                isRed
                loading={isLoadingGlobalConfig || isSettingGlobalConfig}
                label={`${isAutoSleepAllowed ? 'Disable' : 'Enable'} container automation`}
                confirmation={{
                  title: `${isAutoSleepAllowed ? 'Disable' : 'Enable'} container automation`,
                  description: (
                    <RebootDescription>
                      <p>
                        The container automation feature sends miners to sleep if critical container
                        pump failures occur in Bitmain immersion containers.
                      </p>
                    </RebootDescription>
                  ),
                  onConfirm: () => onEnableDisableGlobalConfig(!isAutoSleepAllowed),
                  icon: <QuestionCircleOutlined style={{ color: COLOR.RED }} />,
                }}
              />
            </Col>
          )}
        </Row>
        <HeaderTabs
          defaultActiveKey="FEATURE_MANAGEMENT"
          centered
          type="card"
          items={headerTabItems}
        />
      </SettingsContainer>
    </GateKeeper>
  )
}

export default Settings
