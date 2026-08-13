import { useWindowSize } from './useWindowSize'

const MOBILE_MAX_WIDTH = 767
const TABLET_MAX_WIDTH = 991

const useDeviceResolution = () => {
  const { windowWidth } = useWindowSize()

  const isMobile = windowWidth <= MOBILE_MAX_WIDTH
  const isTablet = windowWidth > MOBILE_MAX_WIDTH && windowWidth <= TABLET_MAX_WIDTH

  return {
    isMobile,
    isTablet,
  }
}

export default useDeviceResolution
