/**
 * Shared types for Financial views
 */

/**
 * Handler function for date range changes in Financial components
 */
export type DateRangeChangeHandler = (
  dates: [Date, Date],
  options?: { year?: number; month?: number; period?: string },
) => void
