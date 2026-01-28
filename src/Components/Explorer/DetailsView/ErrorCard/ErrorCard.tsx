import _map from 'lodash/map'
import _split from 'lodash/split'

import { StyledCardContainer, ErrorTitle, ErrorMessage } from './ErrorCard.styles'

const ErrorCard = ({ error = '' }) => {
  const errorLines = _split(error, '\n')

  return (
    <StyledCardContainer>
      <ErrorTitle>Errors</ErrorTitle>
      <ErrorMessage>
        {_map(errorLines, (line: string, index: number) => (
          <span key={index}>
            {line}
            {index !== errorLines.length - 1 && <br />}
          </span>
        ))}
      </ErrorMessage>
    </StyledCardContainer>
  )
}

export default ErrorCard
