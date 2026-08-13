import Button from 'antd/es/button'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _toUpper from 'lodash/toUpper'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ModalFooter } from './PositionChangeDialog.styles'

import { flexColumn } from '@/app/mixins/index'
import { useGetListThingsQuery } from '@/app/services/api'
import {
  getContainerName,
  getSupportedContainerTypesFromMinerType,
} from '@/app/utils/containerUtils'
import { appendContainerToTag, getMinerShortCode } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getByTypesQuery } from '@/app/utils/queryUtils'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'
import { POLLING_20s } from '@/constants/pollingIntervalConstants'
import { ROUTE } from '@/constants/routes'
import { useSmartPolling } from '@/hooks/useSmartPolling'

const ContainerSelectionCard = styled.div`
  border: 1px solid ${COLOR.COLD_ORANGE};
  padding: 8px 8px 8px 20px;
  cursor: pointer;
  margin-top: 2px;

  &:hover {
    background-color: ${COLOR.COLD_ORANGE};
  }
`

const ContainerSelectionDialogContainer = styled.div`
  max-height: 300px;
  overflow-y: scroll;
`

const MinerInfoContainer = styled.div`
  ${flexColumn};
  margin-top: 10px;
  margin-bottom: 10px;
  gap: 5px;
`

interface ContainerSelectionDialogContentProps {
  selectedSocketToReplace?: UnknownRecord
  onCancel: (value?: boolean) => void
}

const ContainerSelectionDialogContent = ({
  onCancel,
  selectedSocketToReplace,
}: ContainerSelectionDialogContentProps) => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const miner = (selectedSocketToReplace as UnknownRecord | undefined)?.miner as
    | UnknownRecord
    | undefined
  const supportedContainerTypes = getSupportedContainerTypesFromMinerType(
    (miner?.type as string | undefined) ?? '',
  )
  const { data: containers, isLoading: isContainersLoading } = useGetListThingsQuery(
    {
      query: getByTypesQuery(supportedContainerTypes || []),
      status: 1,
      limit: 1000,
      sort: JSON.stringify({ 'info.container': 1 }),
      fields: JSON.stringify({
        'info.container': 1,
      }),
    },
    {
      pollingInterval: smartPolling20s,
      skip: _isEmpty(supportedContainerTypes),
    },
  )

  return (
    <>
      <ContainerSelectionDialogContainer>
        {isContainersLoading && <Spinner />}
        <MinerInfoContainer>
          <div>
            Code:{' '}
            {getMinerShortCode(
              (miner?.code as string | undefined) ?? '',
              ((miner?.tags as string[] | undefined) ?? []) || [],
            )}
          </div>
          <div>
            SN:{' '}
            {((miner?.info as UnknownRecord | undefined)?.serialNum as string | undefined) ?? ''}
          </div>
          <div>
            MAC:{' '}
            {_toUpper(
              ((miner?.info as UnknownRecord | undefined)?.macAddress as string | undefined) ?? '',
            )}
          </div>
        </MinerInfoContainer>

        {_map(_head(containers as UnknownRecord[] | undefined), (container) => {
          const containerRecord = container as UnknownRecord | undefined
          const containerInfo = containerRecord?.info as UnknownRecord | undefined
          const containerName = containerInfo?.container as string | undefined
          return (
            <Link
              onClick={() => onCancel(true)}
              to={`${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/${appendContainerToTag(
                containerName ?? '',
              )}/pdu/edit?selectedSocketToReplace=${JSON.stringify(selectedSocketToReplace)}`}
            >
              <ContainerSelectionCard>
                {containerName && getContainerName(containerName)}
              </ContainerSelectionCard>
            </Link>
          )
        })}
      </ContainerSelectionDialogContainer>
      <ModalFooter>
        <Button onClick={() => onCancel()}>Cancel</Button>
      </ModalFooter>
    </>
  )
}

export default ContainerSelectionDialogContent
