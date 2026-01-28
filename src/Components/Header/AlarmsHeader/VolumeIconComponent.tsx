import VolumeOffIcon from '../Icons/VolumeOff'
import VolumeOnIcon from '../Icons/VolumeOn'

interface VolumeIconComponentProps {
  isBuzzerSilenced?: boolean
}

export const VolumeIconComponent = ({ isBuzzerSilenced }: VolumeIconComponentProps) =>
  isBuzzerSilenced ? <VolumeOffIcon /> : <VolumeOnIcon />
