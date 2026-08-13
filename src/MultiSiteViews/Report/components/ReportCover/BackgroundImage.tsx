import { StyledBackground } from './ReportCover.style'

/**
 * Optimized background image component with WebP support and lazy loading
 * Performance: Saves ~456KB (90.4% reduction from original PNG)
 */
export const BackgroundImage = () => (
  <StyledBackground>
    <source srcSet="/l.webp" type="image/webp" />
    <img src="/l.png" alt="Background" loading="lazy" />
  </StyledBackground>
)
