import {
  SiteTotalLeft,
  SiteTotalName,
  SiteTotalUnit,
  SiteTotalRight,
  SiteTotalValue,
  SiteTotalTitle,
  SiteTotalWrapper,
} from './SiteTotal.styles'

import { formatNumber } from '@/app/utils/format'
import { UNITS } from '@/constants/units'

type SiteTotalProps = {
  title: string
  siteName: string
  siteUnit: string
  siteTotal: number
}

const SiteTotal = ({
  siteTotal = 8412,
  title = 'Site Total',
  siteName = 'SATEC PM180',
  siteUnit = UNITS.POWER_KW,
}: SiteTotalProps) => (
  <SiteTotalWrapper>
    <SiteTotalLeft>
      <SiteTotalTitle>{title}</SiteTotalTitle>
      <SiteTotalName>{siteName}</SiteTotalName>
    </SiteTotalLeft>
    <SiteTotalRight>
      <SiteTotalValue>{formatNumber(siteTotal, { minimumFractionDigits: 2 })}</SiteTotalValue>
      <SiteTotalUnit>{siteUnit}</SiteTotalUnit>
    </SiteTotalRight>
  </SiteTotalWrapper>
)

export default SiteTotal
