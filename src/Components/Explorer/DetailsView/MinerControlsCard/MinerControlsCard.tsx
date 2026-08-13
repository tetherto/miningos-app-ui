import Tooltip from 'antd/es/tooltip'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _isString from 'lodash/isString'
import _join from 'lodash/join'
import _map from 'lodash/map'
import _size from 'lodash/size'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import AddReplaceMinerDialog from '../../../../Views/Container/Tabs/PduTab/AddReplaceMinerDialog/AddReplaceMinerDialog'
import ContainerSelectionDialog from '../../../../Views/Container/Tabs/PduTab/PositionChangeDialog/ContainerSelectionDialog'
import PositionChangeDialog from '../../../../Views/Container/Tabs/PduTab/PositionChangeDialog/PositionChangeDialog'
import RemoveMinerDialog from '../../../../Views/Container/Tabs/PduTab/PositionChangeDialog/RemoveMinerDialog'
import { DangerButton, PrimaryButton } from '../../../ActionsSidebar/ActionCard/ActionCard.styles'
import { Spinner } from '../../../Spinner/Spinner'
import MinerPowerModeSelectionButtons from '../MinerPowerModeSelectionButtons/MinerPowerModeSelectionButtons'
import { MinerSetupFrequencyDropdown } from '../MinerSetupFrequencyDropdown/MinerSetupFrequencyDropdown'

import { ContentWrapper, LabeledCardWrapper } from './MinerControlsCard.styles'
import { getLedButtonsStatus } from './MinerControlsCard.util'

import { actionsSlice, selectPendingSubmissions } from '@/app/slices/actionsSlice'
import { selectSelectedDevices } from '@/app/slices/devicesSlice'
import { getSelectedDevicesTags } from '@/app/utils/actionUtils'
import { appendIdToTag, getOnOffText, isMiner } from '@/app/utils/deviceUtils'
import { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ACTION_TYPES } from '@/constants/actions'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'
import { COMPLETE_MINER_TYPES } from '@/constants/deviceConstants'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { POSITION_CHANGE_DIALOG_FLOWS } from '@/constants/dialog'
import type { Device } from '@/hooks/hooks.types'
import { useNotification } from '@/hooks/useNotification'
import { useUpdateExistedActions } from '@/hooks/useUpdateExistedActions'
import { SecondaryButton } from '@/styles/shared-styles'
import { StyledDangerButton } from '@/Views/Container/Tabs/PduTab/PositionChangeDialog/PositionChangeDialog.styles'

interface PendingSubmission {
  id: string | number
  action: string
  tags: string[]
  [key: string]: unknown
}

const { setAddPendingSubmissionAction } = actionsSlice.actions

interface MinerControlsCardProps {
  buttonsStates: Record<string, boolean | undefined>
  isLoading: boolean
  showPowerModeSelector?: boolean
}

const MinerControlsCard = ({
  buttonsStates,
  isLoading,
  showPowerModeSelector = true,
}: MinerControlsCardProps) => {
  const { notifyInfo } = useNotification()
  const dispatch = useDispatch()
  interface DeviceWithType {
    type: string
    info?: {
      container?: string
      macAddress?: string
    }
    code?: string
    id?: string
    tags?: string[]
    rack?: string
    last?: {
      snap?: {
        config?: {
          power_mode?: string
          led_status?: boolean
        }
      }
    }
  }

  const storedSelectedDevices = useSelector(selectSelectedDevices)
  const selectedDevicesWithType = _filter(
    storedSelectedDevices as unknown as DeviceWithType[],
    (device: DeviceWithType) => isMiner(device.type) && device.id !== undefined,
  )
  // Convert DeviceWithType[] to Device[] by filtering out devices without required id
  const selectedDevices: Device[] = selectedDevicesWithType
    .filter((device): device is DeviceWithType & { id: string } => device.id !== undefined)
    .map(
      (device) =>
        ({
          id: device.id!,
          code: device?.code,
          type: device.type,
          info: device.info,
          tags: device.tags,
          rack: device.rack,
          last: device.last,
        }) as Device,
    )
  const headDevice = _head(selectedDevices)
  const deviceSelectionSize = _size(selectedDevices)
  // Extract minersType from headDevice rack or use first device's rack
  const minersType = headDevice?.rack || selectedDevices[0]?.rack || undefined
  const minersSelectedMaintenance = _size(
    _filter(
      selectedDevices,
      (device: Device) => isMiner(device.type) && device?.info?.container === MAINTENANCE_CONTAINER,
    ),
  )
  const isDeviceContainerMaintenance = headDevice?.info?.container === MAINTENANCE_CONTAINER
  const isSingleDeviceSelected =
    minersSelectedMaintenance === 1 && minersSelectedMaintenance === deviceSelectionSize
  const hasMacAddress = headDevice?.info?.macAddress

  const [isContainerSelectionFlow, setIsContainerSelectionFlow] = useState(false)
  const [isRemoveMinerFlow, setIsRemoveMinerFlow] = useState(false)
  const [isChangeInfoDialogOpen, setIsChangeInfoDialogOpen] = useState(false)
  const [minerDialogFlow, setMinerDialogFlow] = useState<unknown | null>(null)

  const pendingSubmissions = useSelector(selectPendingSubmissions)

  const { updateExistedActions } = useUpdateExistedActions()

  const { isLedOnButtonEnabled, isLedOffButtonEnabled } = getLedButtonsStatus(
    selectedDevices as unknown as Array<UnknownRecord>,
  )

  const doesNonM63MinersExist = (): boolean =>
    !!_find(
      selectedDevices,
      (device: DeviceWithType) => !_includes(device?.type, COMPLETE_MINER_TYPES.WHATSMINER_WM_63),
    )

  const getDevicesTags = (devices: Array<UnknownRecord>) =>
    _map(devices, (device: UnknownRecord) => appendIdToTag(device.id as string))

  const getDevicesContainerInfo = (devices: Array<UnknownRecord>) =>
    _map(
      devices,
      (device: UnknownRecord) => (device?.info as { container?: string } | undefined)?.container,
    )

  const rebootMiner = () => {
    const selectedDevicesTags = getSelectedDevicesTags(selectedDevices as unknown as Device[])
    updateExistedActions({
      actionType: ACTION_TYPES.REBOOT,
      pendingSubmissions: pendingSubmissions as PendingSubmission[],
      selectedDevices: selectedDevices as unknown as Device[],
    })

    const codesList = _map(selectedDevices, ({ code }) => code)

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.REBOOT,
        tags: selectedDevicesTags,
        params: [],
        codesList,
      }),
    )
    notifyInfo('Action added', `Reboot ${_join(codesList, ', ')}`)
  }

  const setPowerMode = (devices: Array<UnknownRecord>, powerMode: string) => {
    const changedDevices = _filter(
      devices as unknown as DeviceWithType[],
      (selectedDevice: DeviceWithType) =>
        selectedDevice.last?.snap?.config?.power_mode !== powerMode,
    )

    if (_isEmpty(changedDevices)) {
      notifyInfo('No actions added', "No devices' power mode affected by the action")
    } else {
      const selectedDevicesTags = getDevicesTags(changedDevices as unknown as Array<UnknownRecord>)
      updateExistedActions({
        actionType: ACTION_TYPES.SET_POWER_MODE,
        pendingSubmissions: pendingSubmissions as PendingSubmission[],
        selectedDevices: selectedDevices as unknown as Device[],
      })

      dispatch(
        setAddPendingSubmissionAction({
          type: 'voting',
          action: ACTION_TYPES.SET_POWER_MODE,
          tags: selectedDevicesTags,
          params: [powerMode],
          crossThing: {
            type: CROSS_THING_TYPES.CONTAINER,
            params: {
              containers: getDevicesContainerInfo(devices),
            },
          },
        }),
      )
      notifyInfo('Action added', `Set Power Mode ${powerMode} to ${changedDevices.length} devices`)
    }
  }

  const setUpFrequencySettings = (frequency: string | number) => {
    const freq = _isString(frequency) ? Number(frequency) : frequency
    const selectedDevicesTags = getDevicesTags(selectedDevices as unknown as Array<UnknownRecord>)
    updateExistedActions({
      actionType: ACTION_TYPES.SETUP_FREQUENCY_SPEED,
      pendingSubmissions: pendingSubmissions as unknown as PendingSubmission[],
      selectedDevices: selectedDevices as unknown as Device[],
    })

    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.SETUP_FREQUENCY_SPEED,
        tags: selectedDevicesTags,
        params: [freq],
        crossThing: {
          type: CROSS_THING_TYPES.CONTAINER,
          params: {
            containers: getDevicesContainerInfo(selectedDevices as unknown as Array<UnknownRecord>),
          },
        },
      }),
    )
    notifyInfo(
      'Action added',
      `Set Up Frequency Settings ${freq} to ${deviceSelectionSize} devices`,
    )
  }

  const backFromMaintenance = () => {
    setIsContainerSelectionFlow(true)
  }

  const onCloseContainerSelection = () => {
    setIsContainerSelectionFlow(false)
  }

  const setLed = (isOn: boolean) => {
    const changedDevices = _filter(
      storedSelectedDevices,
      (selectedDevice: Device) => selectedDevice?.last?.snap?.config?.led_status !== isOn,
    )

    if (_isEmpty(changedDevices)) {
      notifyInfo('No actions added', "No devices' LEDs affected by the action")
    } else {
      updateExistedActions({
        actionType: ACTION_TYPES.SET_LED,
        pendingSubmissions: pendingSubmissions as unknown as PendingSubmission[],
        selectedDevices: selectedDevices as unknown as Device[],
      })

      // Extract codes from tags since Device doesn't have code property directly
      const codesList = _map(changedDevices, (device: Device) => {
        const codeTag = device.tags?.find(
          (tag: string) => tag.startsWith('code-') && !tag.endsWith('undefined'),
        )
        return codeTag ? codeTag.replace('code-', '') : undefined
      }).filter((code) => code !== undefined)

      dispatch(
        setAddPendingSubmissionAction({
          type: 'voting',
          action: ACTION_TYPES.SET_LED,
          tags: getDevicesTags(changedDevices as unknown as Array<UnknownRecord>),
          params: [isOn],
          codesList,
        }),
      )
      notifyInfo('Action added', `Set LED ${getOnOffText(isOn)} on ${_join(codesList, ', ')}`)
    }
  }

  const onMinerInfoChangeClick = () => {
    setIsChangeInfoDialogOpen(true)
  }

  if (minersSelectedMaintenance > 1 && deviceSelectionSize === minersSelectedMaintenance)
    return null

  return (
    <div>
      <LabeledCardWrapper label="Miner Controls" noMargin>
        {isLoading && <Spinner />}
        <ContentWrapper>
          {isSingleDeviceSelected && isDeviceContainerMaintenance ? (
            <>
              <PrimaryButton disabled={isLoading} onClick={onMinerInfoChangeClick}>
                Change Miner Info
              </PrimaryButton>
              <Tooltip title={!hasMacAddress && 'Please add a mac address'}>
                <SecondaryButton
                  disabled={isLoading || !hasMacAddress}
                  onClick={backFromMaintenance}
                >
                  Back from Maintenance
                </SecondaryButton>
              </Tooltip>
              <StyledDangerButton onClick={() => setIsRemoveMinerFlow(true)}>
                Remove Miner
              </StyledDangerButton>
            </>
          ) : (
            <>
              {showPowerModeSelector && (
                <MinerPowerModeSelectionButtons
                  disabled={isLoading}
                  selectedDevices={selectedDevices}
                  setPowerMode={setPowerMode}
                />
              )}
              <DangerButton disabled={isLoading} onClick={rebootMiner}>
                Reboot
              </DangerButton>
              <MinerSetupFrequencyDropdown
                disabled={
                  buttonsStates.isSetUpFrequencyButtonDisabled ||
                  isLoading ||
                  doesNonM63MinersExist()
                }
                onFrequencyToggle={setUpFrequencySettings}
                buttonText="Setup Freq. Settings"
                selectedFrequency={
                  !_isEmpty(selectedDevices.length)
                    ? [
                        String(
                          (
                            _head(selectedDevices)?.last?.snap as unknown as {
                              stats?: { miner_specific?: { upfreq_speed?: number } }
                            }
                          )?.stats?.miner_specific?.upfreq_speed ?? '',
                        ),
                      ]
                    : []
                }
              />
              <SecondaryButton
                $colPlacement="1"
                disabled={
                  !isLedOnButtonEnabled || buttonsStates.isSetLedOnButtonDisabled || isLoading
                }
                onClick={() => {
                  setLed(true)
                }}
              >
                LEDs on
              </SecondaryButton>
              <SecondaryButton
                disabled={
                  !isLedOffButtonEnabled || buttonsStates.isSetLedOffButtonDisabled || isLoading
                }
                onClick={() => {
                  setLed(false)
                }}
              >
                LEDs off
              </SecondaryButton>
              {!isDeviceContainerMaintenance && deviceSelectionSize === 1 && (
                <>
                  <SecondaryButton
                    disabled={isLoading}
                    onClick={() => setMinerDialogFlow(POSITION_CHANGE_DIALOG_FLOWS.MAINTENANCE)}
                  >
                    Move to Maintenance
                  </SecondaryButton>
                  <SecondaryButton
                    disabled={isLoading}
                    onClick={() => setMinerDialogFlow(POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO)}
                  >
                    Change miner info
                  </SecondaryButton>
                  <SecondaryButton
                    disabled={isLoading}
                    onClick={() =>
                      setMinerDialogFlow(POSITION_CHANGE_DIALOG_FLOWS.CONTAINER_SELECTION)
                    }
                  >
                    Change position
                  </SecondaryButton>
                </>
              )}
            </>
          )}
        </ContentWrapper>
      </LabeledCardWrapper>
      <ContainerSelectionDialog
        miner={headDevice}
        onClose={onCloseContainerSelection}
        open={isContainerSelectionFlow}
      />
      <RemoveMinerDialog
        headDevice={headDevice}
        isRemoveMinerFlow={isRemoveMinerFlow}
        onCancel={() => setIsRemoveMinerFlow(false)}
      />
      <AddReplaceMinerDialog
        isContainerEmpty={true}
        selectedEditSocket={{ miner: headDevice }}
        selectedSocketToReplace={undefined}
        onClose={() => setIsChangeInfoDialogOpen(false)}
        currentDialogFlow={POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO}
        open={isChangeInfoDialogOpen}
        minersType={minersType}
      />
      <PositionChangeDialog
        open={!_isEmpty(minerDialogFlow)}
        onClose={() => setMinerDialogFlow(null)}
        selectedSocketToReplace={
          minerDialogFlow === POSITION_CHANGE_DIALOG_FLOWS.CONTAINER_SELECTION
            ? { miner: headDevice, containerInfo: { container: headDevice?.info?.container } }
            : undefined
        }
        selectedEditSocket={
          minerDialogFlow !== POSITION_CHANGE_DIALOG_FLOWS.CONTAINER_SELECTION
            ? { miner: headDevice, containerInfo: { container: headDevice?.info?.container } }
            : undefined
        }
        dialogFlow={minerDialogFlow as string}
        isContainerEmpty={false}
        onChangePositionClicked={() => {}}
        onPositionChangedSuccess={() => {}}
      />
    </div>
  )
}

export default MinerControlsCard
