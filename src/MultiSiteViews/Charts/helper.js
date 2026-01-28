import _forEach from 'lodash/forEach'
import _reduce from 'lodash/reduce'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'

/**
 *  Data helper functions for stacked charts
 * @param {Array} data - data array containing objects with keys for comparison
 * @param {Object} config - { keyA, keyB, labels: { [key]: string }, colors: { [key]: string } }
 */
export const getStackedComparisonDataset = (data, config, unit) => {
  const { keyA, keyB, labels, colors, labelName } = config

  const datasetA = {
    unit,
    label: labels[keyA],
    stackGroup: 'stack1',
    // Fallback in case  datasetA is undefined
    legendColor: getBarChartItemStyle(colors[keyA])?.backgroundColor,
  }

  const datasetB = {
    unit,
    label: labels[keyB],
    stackGroup: 'stack1',
    // Fallback in case  datasetB is undefined
    legendColor: getBarChartItemStyle(colors[keyB])?.backgroundColor,
  }

  _forEach(data, (entry) => {
    const label = entry[labelName || 'month']

    datasetA[label] = {
      value: entry[keyA] || 0,
      original: entry[keyA],
      displayLabel: labels[keyA],
      style: getBarChartItemStyle(colors[keyA]),
      legendColor: getBarChartItemStyle(colors[keyA])?.backgroundColor,
    }

    datasetB[label] = {
      value: entry[keyB] || 0,
      original: entry[keyB],
      displayLabel: labels[keyB],
      style: getBarChartItemStyle(colors[keyB]),
      legendColor: getBarChartItemStyle(colors[keyB])?.backgroundColor,
    }
  })

  return [datasetA, datasetB]
}

/**
 * Line dataset generator for Chart.js
 *
 * @param {Array} data - data array containing objects with keys for the line
 * @param {Object} config - configuration object with the following properties:
 *  {
 *    key: string,               // key in data objects to extract values for the line
 *    label: string,             // label for the line in the chart legend
 *    color: string,             // color for the line (should be a valid CSS color)
 *    yAxisID?: string           // optional, ID of the y-axis to associate with this line (default is 'y1')
 *  }
 */
export const getLineDatasetByKey = (data, { key, label, color, yAxisID = 'y1' }) => ({
  label,
  type: 'line',
  data: _reduce(
    data,
    (acc, entry) => {
      acc[entry.month] = entry[key] ?? 0
      return acc
    },
    {},
  ),
  borderColor: color,
  backgroundColor: color,
  yAxisID,
  tension: 0.3,
  pointRadius: 3,
  pointHoverRadius: 5,
  fill: false,
  _legendColor: color,
})
