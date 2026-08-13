import _map from 'lodash/map'
import _values from 'lodash/values'
import { FC } from 'react'

import { CurrencyTogglerWrapper, StyledButton } from './CurrencyToggler.styles'

import { CURRENCY } from '@/MultiSiteViews/constants'

interface CurrencyTogglerProps {
  value: string
  onChange: (currency: string) => void
}

export const CurrencyToggler: FC<CurrencyTogglerProps> = ({ value, onChange }) => (
  <CurrencyTogglerWrapper>
    {_map(_values(CURRENCY), (currency: string) => (
      <StyledButton
        key={currency}
        $isActive={value === currency}
        onClick={() => onChange(currency)}
      >
        {currency}
      </StyledButton>
    ))}
  </CurrencyTogglerWrapper>
)
