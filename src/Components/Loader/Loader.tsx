import _map from 'lodash/map'

import { Dot, LoaderContainer } from './Loader.styles'

import { COLOR } from '@/constants/colors'

const DOTS_COUNT = 5

interface LoaderProps {
  size?: number
  color?: string
  glow?: string
}

export const Loader = ({ size = 10, color = COLOR.COLD_ORANGE }: LoaderProps) => (
  <LoaderContainer>
    {_map(Array.from({ length: DOTS_COUNT }), (_, i) => (
      <Dot key={i} $size={size} $activeColor={color} $delay={i * 0.1} />
    ))}
  </LoaderContainer>
)
