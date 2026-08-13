import _isArray from 'lodash/isArray'
import _isNumber from 'lodash/isNumber'
import _isUndefined from 'lodash/isUndefined'
import _map from 'lodash/map'

import { DeviceInfoContainer, InfoContainerDiv, InfoText, InfoValue } from './InfoContainer.styles'

interface InfoContainerProps {
  title?: string
  value?: string | string[] | number
}

export const InfoContainer = ({ title, value }: InfoContainerProps) => (
  <InfoContainerDiv>
    <InfoText>{title}</InfoText>
    <InfoValue>
      {_map(_isArray(value) ? value : [value], (item, index) => (
        <div key={index}>{item}</div>
      ))}
    </InfoValue>
  </InfoContainerDiv>
)

interface InfoItemForContainer {
  title?: string
  value?: string | string[] | number
  [key: string]: unknown
}

interface DeviceInfoProps {
  data?: InfoItemForContainer[]
}

export const DeviceInfo = ({ data }: DeviceInfoProps) => (
  <DeviceInfoContainer>
    {_map(data, (item: InfoItemForContainer, index: number) => {
      const title = item.title
      const value = item.value
      return (
        <InfoContainer
          key={index}
          title={title !== undefined ? String(title) : undefined}
          value={(() => {
            if (_isUndefined(value)) return undefined
            if (_isNumber(value)) return String(value)
            if (_isArray(value)) return _map(value, String)

            return String(value)
          })()}
        />
      )
    })}
  </DeviceInfoContainer>
)
