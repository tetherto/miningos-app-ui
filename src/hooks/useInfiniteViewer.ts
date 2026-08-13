import _debounce from 'lodash/debounce'
import _isNil from 'lodash/isNil'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type InfiniteViewer from 'react-infinite-viewer'

export interface ViewportBoundingBox {
  boundingRect: DOMRect
  scrollWidth: number
  scrollHeight: number
}

const MARGIN = 50
const RECENTER_ANIMATION_DURATION = 100
const ZOOM_INCREMENT = 0.1
const MIN_ZOOM_LEVEL = 0.5
const SCROLL_DEBOUNCE_MS = 100
const RESET_TIMEOUT_MS = 250
const SHRINKAGE_VERTICAL = 0.9
const SHRINKAGE_HORIZONTAL = 0.9
const ZOOM_INCREMENT_FACTOR = 0.001

const getResetZoomLevelForViewer = (
  viewer: InfiniteViewer | null,
  viewportBoundingBox?: ViewportBoundingBox,
): number | undefined => {
  if (!viewer || !viewportBoundingBox) {
    return undefined
  }

  const wrapperBoundingBox = viewer.getWrapper().getBoundingClientRect()
  let basisDimension: 'width' | 'height' = 'width'
  if (viewportBoundingBox.scrollHeight > viewportBoundingBox.scrollWidth) {
    basisDimension = 'height'
  }

  let zoomFactor =
    (wrapperBoundingBox[basisDimension] - MARGIN) /
    viewportBoundingBox[basisDimension === 'width' ? 'scrollWidth' : 'scrollHeight']
  const widthAtZoomFactor = viewportBoundingBox.scrollWidth * zoomFactor
  const heightAtZoomFactor = viewportBoundingBox.scrollHeight * zoomFactor
  const nonBasisDimension = basisDimension === 'width' ? 'height' : 'width'
  const nonBasisDimensionAtZoomFactor =
    nonBasisDimension === 'width' ? widthAtZoomFactor : heightAtZoomFactor
  if (nonBasisDimensionAtZoomFactor > wrapperBoundingBox[nonBasisDimension]) {
    basisDimension = nonBasisDimension
    zoomFactor =
      (wrapperBoundingBox[basisDimension] - MARGIN) /
      viewportBoundingBox[basisDimension === 'width' ? 'scrollWidth' : 'scrollHeight']
  }
  return zoomFactor
}

export interface UseInfiniteViewerReturn {
  minZoomLevel: number
  handleZoomIn: VoidFunction
  handleZoomOut: VoidFunction
  showBackToContent: boolean
  handleBackToContent: VoidFunction
  showInfiniteViewerControls: boolean
  checkShowBackToContent: VoidFunction
  viewportBoundingBox: ViewportBoundingBox | undefined
  infiniteViewerRef: React.RefObject<InfiniteViewer | null>
  registerInfiniteViewer: (node: InfiniteViewer | null) => void
  resetInfiniteViewer: (viewportBB?: ViewportBoundingBox) => void
  forceResetInfiniteViewer: () => void
}

export const useInfiniteViewer = (): UseInfiniteViewerReturn => {
  const infiniteViewerRef = useRef<InfiniteViewer | null>(null)
  const resetTimeoutIdRef = useRef<number | undefined>(undefined)
  const [viewportBoundingBox, setViewportBoundingBox] = useState<ViewportBoundingBox | undefined>(
    undefined,
  )
  const [showBackToContent, setShowBackToContent] = useState<boolean>(false)
  const [showInfiniteViewerControls, setShowInfiniteViewControls] = useState<boolean>(false)

  useEffect(() => {
    const viewer = infiniteViewerRef.current
    if (!viewer) return

    const wrapper = viewer.getWrapper()
    if (!wrapper) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        viewer.zoomBy(-e.deltaY * ZOOM_INCREMENT_FACTOR)
      } else {
        const [dx, dy] = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? [e.deltaX, 0] : [0, e.deltaY]
        viewer.scrollBy(dx, dy)
      }
      checkShowBackToContentDebounced()
    }

    wrapper.addEventListener('wheel', handleWheel, { passive: false })

    return () => wrapper.removeEventListener('wheel', handleWheel)
  }, [showInfiniteViewerControls])

  const minZoomLevel = (() => {
    if (!infiniteViewerRef.current || !viewportBoundingBox) {
      return MIN_ZOOM_LEVEL
    }

    return getResetZoomLevelForViewer(infiniteViewerRef.current, viewportBoundingBox) ?? 0.5
  })()

  const resetInfiniteViewer = useCallback((viewportBB?: ViewportBoundingBox) => {
    const viewer = infiniteViewerRef.current
    const resetZoomLevel = getResetZoomLevelForViewer(viewer, viewportBB)
    if (!_isNil(resetZoomLevel)) {
      viewer?.setZoom(resetZoomLevel)
    }

    viewer?.scrollCenter()
  }, [])

  const updateViewportData = () => {
    const node = infiniteViewerRef.current
    if (node) {
      const viewport = node.getViewport()
      const viewportBB = {
        boundingRect: viewport.getBoundingClientRect(),
        scrollWidth: viewport.scrollWidth,
        scrollHeight: viewport.scrollHeight,
      }
      setViewportBoundingBox(viewportBB)
      return viewportBB
    }
    setViewportBoundingBox(undefined)
    return undefined
  }

  /**
   * Updates the viewport data and resets the infinite viewer so that the correct zoom level is applied
   * To be used when the content inside the viewport changes
   */
  const forceResetInfiniteViewer = () => {
    const viewportBB = updateViewportData()
    resetInfiniteViewer(viewportBB)
  }

  const registerInfiniteViewer = useCallback(
    (node: InfiniteViewer | null) => {
      if (infiniteViewerRef.current === node) {
        return
      }

      if (resetTimeoutIdRef.current !== undefined) {
        clearTimeout(resetTimeoutIdRef.current)
        resetTimeoutIdRef.current = undefined
      }

      infiniteViewerRef.current = node
      setShowInfiniteViewControls(!!node)
      if (node) {
        const viewportBB = updateViewportData()
        resetTimeoutIdRef.current = window.setTimeout(() => {
          resetInfiniteViewer(viewportBB)
        }, RESET_TIMEOUT_MS)
      }
    },
    [resetInfiniteViewer],
  )

  const checkShowBackToContentDebounced = _debounce(() => {
    if (infiniteViewerRef.current) {
      const infiniteViewerScrollLeft = infiniteViewerRef.current.getScrollLeft()
      const infiniteViewerScrollTop = infiniteViewerRef.current.getScrollTop()
      const wrapperBB = infiniteViewerRef.current.getWrapper().getBoundingClientRect()
      const viewportBB = infiniteViewerRef.current.getViewport().getBoundingClientRect()
      const zoom = infiniteViewerRef.current.getZoom()
      const isContentOOBLeft =
        infiniteViewerScrollLeft > 0 &&
        infiniteViewerScrollLeft * zoom > viewportBB.width * SHRINKAGE_HORIZONTAL
      const isContentOOBRight =
        infiniteViewerScrollLeft < 0 &&
        -infiniteViewerScrollLeft * zoom > wrapperBB.width * SHRINKAGE_HORIZONTAL
      const isContentOOBTop =
        infiniteViewerScrollTop > 0 &&
        infiniteViewerScrollTop * zoom > viewportBB.height * SHRINKAGE_VERTICAL
      const isContentOOBBottom =
        infiniteViewerScrollTop < 0 &&
        -infiniteViewerScrollTop * zoom > wrapperBB.height * SHRINKAGE_VERTICAL
      const isContentOOB =
        isContentOOBLeft || isContentOOBRight || isContentOOBTop || isContentOOBBottom
      setShowBackToContent(isContentOOB)
    }
  }, SCROLL_DEBOUNCE_MS)

  const checkShowBackToContent = () => {
    checkShowBackToContentDebounced()
  }

  const handleBackToContent = () => {
    infiniteViewerRef.current?.scrollCenter({
      duration: RECENTER_ANIMATION_DURATION,
    })
  }

  const handleZoomIn = () => {
    infiniteViewerRef.current?.zoomBy(ZOOM_INCREMENT)
    checkShowBackToContent()
  }

  const handleZoomOut = () => {
    infiniteViewerRef.current?.zoomBy(-ZOOM_INCREMENT)
    checkShowBackToContent()
  }

  return {
    infiniteViewerRef,
    viewportBoundingBox,
    showBackToContent,
    showInfiniteViewerControls,
    minZoomLevel,
    registerInfiniteViewer,
    resetInfiniteViewer,
    handleBackToContent,
    handleZoomIn,
    handleZoomOut,
    checkShowBackToContent,
    forceResetInfiniteViewer,
  }
}
