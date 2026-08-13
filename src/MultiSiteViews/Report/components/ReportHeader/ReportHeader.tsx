import { DEFAULT_SHOW_LOGO } from '../../Report.constants'
import { CoverLogo } from '../Icons'

import {
  HeaderWrapper,
  HeaderContent,
  TitleContainer,
  MainTitle,
  SubTitle,
  PriceContainer,
  PriceText,
  PriceValue,
  BottomBorder,
} from './ReportHeader.style'

import BTC from '@/Components/Explorer/List/MinerCard/Icons/BTC'
import { COLOR } from '@/constants/colors'

/**
 * ReportHeader component
 */
interface ReportHeaderProps {
  /** Main title text */
  title?: string
  /** Subtitle text */
  subtitle?: string
  /** Label for the price section */
  priceText?: string
  /** Value displayed in the price section */
  priceValue?: string
  /** Whether to display the cover logo */
  showLogo?: boolean
}

const ReportHeader = ({
  title,
  subtitle,
  priceText,
  priceValue,
  showLogo = DEFAULT_SHOW_LOGO,
}: ReportHeaderProps) => (
  <HeaderWrapper>
    <HeaderContent>
      {showLogo && <CoverLogo />}
      <TitleContainer>
        <MainTitle>{title}</MainTitle>
        <SubTitle>{subtitle}</SubTitle>
      </TitleContainer>
      {priceValue && (
        <PriceContainer>
          <BTC fill={COLOR.ORANGE_WARNING} radius={100} stroke={COLOR.ORANGE_WARNING} />
          <PriceText>{priceText}</PriceText>
          <PriceValue>{priceValue}</PriceValue>
        </PriceContainer>
      )}
    </HeaderContent>
    <BottomBorder />
  </HeaderWrapper>
)

export default ReportHeader
