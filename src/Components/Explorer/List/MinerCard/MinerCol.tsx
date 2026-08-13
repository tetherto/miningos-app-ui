import { FC, ReactNode } from 'react'

import { MinerCardCol, MinerCardColRow } from './MinerCard.styles'

interface MinerColProps {
  dataRow1?: ReactNode
  dataRow2?: ReactNode
  lg?: number
  sm?: number
  md?: number
  xs?: number
}

export const MinerCol: FC<MinerColProps> = ({ dataRow1, dataRow2, lg, sm, md, xs }) => (
  <MinerCardCol sm={sm} md={md} lg={lg} xs={xs}>
    {dataRow1 && <MinerCardColRow>{dataRow1}</MinerCardColRow>}
    {dataRow2 && <MinerCardColRow>{dataRow2}</MinerCardColRow>}
  </MinerCardCol>
)
