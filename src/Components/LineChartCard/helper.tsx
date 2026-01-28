export const LIMIT = 288

export const CHART_MIN_HEIGHT = 400

export const timelineToMs = (timeline: unknown) => {
  if (timeline === '20s') return 20 * 1000
  if (timeline === '1m') return 60 * 1000
  if (timeline === '5m') return 5 * 60 * 1000
  if (timeline === '30m') return 30 * 60 * 1000
  if (timeline === '3h') return 3 * 60 * 60 * 1000
  if (timeline === '1D') return 24 * 60 * 60 * 1000
  // Default fallback for '1h' or any other value
  return 60 * 60 * 1000
}

const TIME_FORMAT_BY_TIMELINE: Record<string, string> = {
  '1m': 'HH:mm',
  '5m': 'HH:mm',
  '30m': 'HH:mm',
  '3h': 'HH:mm',
  '1D': 'MMM dd',
}

export const getTimelineDateFormat = (timeline: string): string =>
  TIME_FORMAT_BY_TIMELINE[timeline] ?? 'HH:mm'

const VISIBLE_POINTS_BY_TIMELINE: Record<string, number> = {
  '1m': 15,
  '5m': 12,
  '30m': 12,
  '3h': 12,
  '1D': 14,
}

export const getVisibleDataPointsForTimeline = (timeline: string): number =>
  VISIBLE_POINTS_BY_TIMELINE[timeline] ?? 24
