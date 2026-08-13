import _get from 'lodash/get'
import _isNil from 'lodash/isNil'
import type { FC } from 'react'

import {
  POOL_VALIDATION_STATUS_LABELS,
  POOL_VALIDATION_STATUSES,
} from '../../PoolManager.constants'

import {
  HeaderSubtitle,
  HeaderTitle,
  HeaderTitleSection,
  HeaderWrapper,
  MinerCountSection,
  ValidationSection,
} from './PoolCollapseItemHeader.styles'

import { COLOR } from '@/constants/colors'

interface Pool {
  validation?: {
    status?: string
  }
  [key: string]: unknown
}

interface PoolCollapseItemHeaderProps {
  pool: Pool
}

export const PoolCollapseItemHeader: FC<PoolCollapseItemHeaderProps> = ({ pool }) => {
  const isPoolValidated = pool.validation?.status === POOL_VALIDATION_STATUSES.TESTED
  const poolValidationColor = isPoolValidated
    ? `color(from ${COLOR.GREEN} srgb r g b / 0.1)`
    : COLOR.RED
  const poolValidationTextColor = isPoolValidated ? COLOR.GREEN : COLOR.WHITE

  return (
    <HeaderWrapper>
      <HeaderTitleSection>
        <HeaderTitle>{pool.name as string}</HeaderTitle>
        <HeaderSubtitle>{pool.description as string}</HeaderSubtitle>
      </HeaderTitleSection>
      <MinerCountSection>
        {Boolean(pool.units) && `${pool.units} Units`}{' '}
        {Boolean(pool.miners) && `${pool.miners} Miners`}
      </MinerCountSection>
      {!_isNil(pool.validation) && (
        <ValidationSection $bgColor={poolValidationColor} $color={poolValidationTextColor}>
          {
            _get(
              POOL_VALIDATION_STATUS_LABELS,
              pool.validation.status as string,
              pool.validation.status as string,
            ) as string
          }
        </ValidationSection>
      )}
    </HeaderWrapper>
  )
}

export default PoolCollapseItemHeader
