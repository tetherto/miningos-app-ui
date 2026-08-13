import { QuestionCircleOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _slice from 'lodash/slice'
import pluralize from 'pluralize'
import { useEffect, useState, FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import LabeledCard from '../../../Card/LabeledCard'
import { DangerActionButton } from '../../../DangerActionButton/DangerActionButton'
import SecondaryStatCard from '../SecondaryStatCard/SecondaryStatCard'

import { ContainerControlsCardRow, ControlWrapper } from './ContainerControlsCard.styles'

import { actionsSlice } from '@/app/slices/actionsSlice'
import { selectSelectedSockets } from '@/app/slices/devicesSlice'
import { getNumberSelected, isContainerControlNotsupported } from '@/app/utils/containerUtils'
import { appendContainerToTag, getOnOffText, unitToKilo } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { notifyInfo } from '@/app/utils/NotificationService'
import { ACTION_TYPES } from '@/constants/actions'
import type { SocketData } from '@/types/redux'

const { setAddPendingSubmissionAction } = actionsSlice.actions

interface ButtonsStates {
  isMinerControlButtonDisabled?: boolean
  isCoolingControlButtonDisabled?: boolean
  isSwitchSocketButtonDisabled?: boolean
}

interface ContainerControlsCardProps {
  isLoading?: boolean
  buttonsStates?: ButtonsStates
}

const ContainerControlsCard: FC<ContainerControlsCardProps> = ({
  isLoading,
  buttonsStates = {},
}) => {
  const selectedSockets = useSelector(selectSelectedSockets)
  const { nSockets } = getNumberSelected(
    selectedSockets as unknown as Record<
      string,
      { sockets: Array<{ socket: string; enabled: boolean }> }
    >,
  )

  const [stats, setStats] = useState<UnknownRecord>({})
  const dispatch = useDispatch()

  useEffect(() => {
    setStats(getSelectedSocketsStats())
  }, [selectedSockets])

  const isContainerControlsNotsupportedForSelectedSockets = () =>
    _find(_keys(selectedSockets), (container: string) => isContainerControlNotsupported(container))

  const switchSocket = (isOn: boolean) => {
    _forEach(_keys(selectedSockets), (selectedContainerSocket: string) => {
      const sockets = _map(
        selectedSockets[selectedContainerSocket]?.sockets,
        (selectedSocket: SocketData) => {
          const currentStatus = selectedSocket.enabled
          const isChanged = (currentStatus && !isOn) || (!currentStatus && isOn)
          return [selectedSocket.pduIndex, selectedSocket.socketIndex, isOn, isChanged] as [
            string | number | undefined,
            string | number | undefined,
            boolean,
            boolean,
          ]
        },
      )

      const changedSockets = _filter(
        sockets,
        (socket: [string | number | undefined, string | number | undefined, boolean, boolean]) => {
          const [, , , isChanged] = socket
          return isChanged
        },
      )

      const socketData = _map(
        sockets,
        (
          changedSocket: [
            string | number | undefined,
            string | number | undefined,
            boolean,
            boolean,
          ],
        ) => _slice(changedSocket, 0, 3),
      )

      if (_isEmpty(changedSockets)) {
        notifyInfo('No actions added', 'No sockets affected by the action')
      } else {
        dispatch(
          setAddPendingSubmissionAction({
            type: 'voting',
            action: ACTION_TYPES.SWITCH_SOCKET,
            tags: [appendContainerToTag(selectedContainerSocket)],
            params: [socketData],
          }),
        )
        notifyInfo(
          'Action added',
          `Switch ${sockets?.length} ${pluralize('Socket', sockets?.length)} ${getOnOffText(isOn)} `,
        )
      }
    })
  }

  const getSelectedSocketsStats = () => {
    const stats = {
      power: 0,
      current: 0,
    }

    _forEach(_keys(selectedSockets), (selectedContainerSocket: string) => {
      const sockets = selectedSockets[selectedContainerSocket]?.sockets
      if (sockets && Array.isArray(sockets)) {
        _forEach(sockets as unknown as SocketData[], (socket: SocketData) => {
          stats.power += socket?.power_w || 0
          stats.current += socket?.current_a || 0
        })
      }
    })
    return stats
  }

  if (nSockets <= 0) {
    return null
  }

  return (
    <>
      {!isContainerControlsNotsupportedForSelectedSockets() && (
        <LabeledCard label="Container Controls" noMargin>
          <ContainerControlsCardRow>
            <ControlWrapper>
              <SecondaryStatCard
                name="Power (KW)"
                value={unitToKilo((stats?.power as number) ?? 0)}
              />
              <SecondaryStatCard
                name="Current (A)"
                value={formatNumber((stats?.current as number) ?? 0)}
              />
              <DangerActionButton
                confirmation={{
                  title: 'Power on sockets',
                  description:
                    'Please ensure cooling system is ON before turning ON sockets and miners',
                  onConfirm: () => switchSocket(true),
                  icon: <QuestionCircleOutlined style={{ color: 'red' }} />,
                }}
                disabled={buttonsStates.isSwitchSocketButtonDisabled || isLoading}
                label="Power on"
              />
              <Button
                disabled={buttonsStates.isSwitchSocketButtonDisabled || isLoading}
                onClick={() => switchSocket(false)}
              >
                Power off
              </Button>
            </ControlWrapper>
          </ContainerControlsCardRow>
        </LabeledCard>
      )}
    </>
  )
}

export default ContainerControlsCard
