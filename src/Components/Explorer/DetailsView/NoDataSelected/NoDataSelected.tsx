import { FC } from 'react'

import NoDataIcon from './NoDataIcon'

interface NoDataSelectedProps {
  text?: string
  subtext?: string
}

const NoDataSelected: FC<NoDataSelectedProps> = ({ text = '', subtext = '' }) => (
  <>
    <NoDataIcon />
    <p>{text}</p>
    <p>{subtext}</p>
  </>
)

export default NoDataSelected
