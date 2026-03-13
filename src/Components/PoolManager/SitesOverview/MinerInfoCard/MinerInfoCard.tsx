import Alert from 'antd/es/alert'
import _get from 'lodash/get'
import _isNil from 'lodash/isNil'

import { SITE_OVERVIEW_STATUS_COLORS } from '../../PoolManager.constants'
import { getMinerStatus } from '../../SiteOverviewDetails/SiteOverviewDetailsContainer.utils'

import {
  MinerInfoCardWrapper,
  Header,
  Pdu,
  PoolInfoField,
  PoolInfoFields,
  PoolInfoFieldTitle,
  PoolInfoFieldValue,
  PoolInformationSection,
  PoolInfoTitle,
  Socket,
  SubTitle,
  Title,
  SocketBadge,
} from './MinerInfoCard.styles'

import { useGetPoolForMinerQuery } from '@/app/services/api'
import { getMinerName } from '@/app/utils/deviceUtils'
import { Spinner } from '@/Components/Spinner/Spinner'
import { MinerData } from '@/hooks/useSiteOverviewDetailsData'
import { PoolSummary } from '@/Views/PoolManager/types'

export type MinerInfoCardProps = {
  selectedItems: Set<string>
  poolIdMap: Record<string, PoolSummary>
  minersHashmap: Record<string, MinerData>
}

export const MinerInfoCard = ({ selectedItems, poolIdMap, minersHashmap }: MinerInfoCardProps) => {
  const socket = selectedItems.size > 0 ? JSON.parse(Array.from(selectedItems)[0]) : undefined
  const { pduIndex, socketIndex } = socket ?? {}

  const miner = socket ? _get(minersHashmap, [`${pduIndex}_${socketIndex}`]) : undefined
  const pool = socket ? _get(poolIdMap, [_get(miner, ['info', 'poolConfig'])]) : undefined
  const endpoint = _get(pool, ['endpoints', '0', 'url'])
  const minerName = socket && miner?.type ? getMinerName(miner?.type) : undefined
  const hashrate = miner?.hashrate.value
    ? `${miner?.hashrate.value} ${miner?.hashrate.unit}`
    : undefined

  const {
    data: poolForMiner,
    isLoading,
    error: poolForMinerLoadingError,
  } = useGetPoolForMinerQuery(
    {
      minerId: miner?.id,
    },
    {
      skip: _isNil(miner),
    },
  )

  const isOverriden = _get(poolForMiner, ['overriddenConfig'])
  const statusKnown = !_isNil(isOverriden)
  let status: string = '-'
  if (statusKnown) {
    if (isOverriden) {
      status = 'Override'
    } else {
      status = 'Normal'
    }
  }
  const hasError = !_isNil(poolForMinerLoadingError)

  return (
    <MinerInfoCardWrapper>
      <Header>
        <Title>Miner Info</Title>
        <SubTitle>
          <Pdu>
            {minerName} {pduIndex}
          </Pdu>
          <Socket>
            <SocketBadge color={SITE_OVERVIEW_STATUS_COLORS[getMinerStatus(miner)]} />
            <span>Socket: {socketIndex}</span>
          </Socket>
        </SubTitle>
      </Header>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {hasError ? (
            <Alert type="error" message="Failed to load data" />
          ) : (
            <PoolInformationSection>
              <PoolInfoTitle>Pool Information</PoolInfoTitle>
              <PoolInfoFields>
                <PoolInfoField>
                  <PoolInfoFieldTitle>Pool</PoolInfoFieldTitle>
                  <PoolInfoFieldValue>{pool?.name ?? 'None'}</PoolInfoFieldValue>
                </PoolInfoField>
                <PoolInfoField>
                  <PoolInfoFieldTitle>Endpoint</PoolInfoFieldTitle>
                  <PoolInfoFieldValue>{endpoint ?? 'None'}</PoolInfoFieldValue>
                </PoolInfoField>
                <PoolInfoField>
                  <PoolInfoFieldTitle>Hashrate</PoolInfoFieldTitle>
                  <PoolInfoFieldValue>{hashrate ?? '-'}</PoolInfoFieldValue>
                </PoolInfoField>
                <PoolInfoField>
                  <PoolInfoFieldTitle>Status</PoolInfoFieldTitle>
                  <PoolInfoFieldValue>{status}</PoolInfoFieldValue>
                </PoolInfoField>
              </PoolInfoFields>
            </PoolInformationSection>
          )}
        </>
      )}
    </MinerInfoCardWrapper>
  )
}
