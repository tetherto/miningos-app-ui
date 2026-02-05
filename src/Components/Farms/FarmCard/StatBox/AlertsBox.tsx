import Tooltip from 'antd/es/tooltip'
import _map from 'lodash/map'
import _values from 'lodash/values'
import { FC } from 'react'
import { Link } from 'react-router'

import { SEVERITY } from '../../../../constants/alerts'

import { AlertCountTextContainer } from './AlertsBox.styles'
import { AlertsBoxContainer } from './StatBox.styles'
import { getDisplayValue } from './StatBox.util'

interface AlertsBoxProps {
  nAlerts?: Record<string, number>
  isLoading: boolean
}

const AlertsBox: FC<AlertsBoxProps> = ({ nAlerts, isLoading }) => (
  <AlertsBoxContainer>
    {_map(_values(SEVERITY), (severity, idx) => {
      const queryParams = new URLSearchParams({ severity })
      const linkTo = `/alerts?${queryParams}`

      const alertValue = nAlerts?.[severity]
      const displayValue = getDisplayValue(alertValue ?? 0, isLoading)

      return (
        <Tooltip title={severity} key={idx}>
          <Link to={linkTo}>
            <AlertCountTextContainer
              $severity={severity}
              $blink={severity === SEVERITY.CRITICAL && (alertValue ?? 0) > 0 && !isLoading}
            >
              {displayValue}
            </AlertCountTextContainer>
          </Link>
        </Tooltip>
      )
    })}
  </AlertsBoxContainer>
)

export default AlertsBox
