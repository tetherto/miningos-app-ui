import _keys from 'lodash/keys'
import { describe, expect, it } from 'vitest'

import { getLineDatasetByKey, getStackedComparisonDataset } from '@/MultiSiteViews/Charts/helper'

describe('MultiSiteViews Charts Helper Functions', () => {
  describe('getStackedComparisonDataset', () => {
    const baseConfig = {
      keyA: 'curtailment',
      keyB: 'opIssues',
      labels: {
        curtailment: 'Curtailment',
        opIssues: 'Op. Issues',
      },
      colors: {
        curtailment: 'PURPLE',
        opIssues: 'BLUE',
      },
    }

    it('should return datasets with correct structure and values', () => {
      const data = [
        { month: '04-24', curtailment: 27, opIssues: 32 },
        { month: '05-24', curtailment: 26, opIssues: 28 },
        { month: '06-24', curtailment: 38, opIssues: 38 },
      ]

      const [datasetA, datasetB] = getStackedComparisonDataset(data, baseConfig)

      expect(datasetA.label).toBe('Curtailment')
      expect(datasetB.label).toBe('Op. Issues')
      expect(datasetA['04-24'].value).toBe(27)
      expect(datasetB['04-24'].value).toBe(32)
      expect(datasetA.stackGroup).toBe('stack1')
      expect(datasetB.stackGroup).toBe('stack1')
    })

    it('should handle equal values correctly', () => {
      const data = [{ month: '04-24', curtailment: 30, opIssues: 30 }]
      const [datasetA, datasetB] = getStackedComparisonDataset(data, baseConfig)

      expect(datasetA['04-24'].value).toBe(30)
      expect(datasetB['04-24'].value).toBe(30)
    })

    it('should return empty datasets for empty data', () => {
      const [datasetA, datasetB] = getStackedComparisonDataset([], baseConfig)

      expect(datasetA).toMatchObject({
        label: 'Curtailment',
        legendColor: ['#6366F14d', '#6366F11a'],
        stackGroup: 'stack1',
      })
      expect(datasetB).toMatchObject({
        label: 'Op. Issues',
        legendColor: ['#1890FF4d', '#1890FF1a'],
        stackGroup: 'stack1',
      })
    })

    it('should handle missing data values gracefully', () => {
      const data = [
        { month: '04-24', curtailment: 27, opIssues: 32 },
        { month: '05-24', curtailment: 26 }, // Missing opIssues
        { month: '06-24', opIssues: 38 }, // Missing curtailment
      ]

      const [datasetA, datasetB] = getStackedComparisonDataset(data, baseConfig)

      expect(datasetA['05-24'].value).toBe(26)
      expect(datasetB['05-24'].value).toBe(0)
      expect(datasetA['06-24'].value).toBe(0)
      expect(datasetB['06-24'].value).toBe(38)
    })

    it('should use custom labelName when provided', () => {
      const data = [
        { period: 'Q1', curtailment: 27, opIssues: 32 },
        { period: 'Q2', curtailment: 26, opIssues: 28 },
      ]

      const config = { ...baseConfig, labelName: 'period' }
      const [datasetA, datasetB] = getStackedComparisonDataset(data, config)

      expect(_keys(datasetA)).toContain('Q1')
      expect(datasetA.Q1.value).toBe(27)
      expect(datasetB.Q2.value).toBe(28)
    })

    it('should throw if unknown keys are used', () => {
      const data = [{ month: '04-24', unexpected: 99 }]
      const config = {
        ...baseConfig,
        keyA: 'unexpected',
        keyB: 'nonexistent',
      }

      expect(() => getStackedComparisonDataset(data, config)).toThrow()
    })
  })

  describe('getLineDatasetByKey', () => {
    const baseConfig = {
      key: 'feePercent',
      label: 'Fee %',
      color: 'RED',
    }

    it('should return a line dataset with correct structure and values', () => {
      const data = [
        { month: '04-24', feePercent: 200 },
        { month: '05-24', feePercent: 210 },
        { month: '06-24', feePercent: 195 },
      ]

      const lineDataset = getLineDatasetByKey(data, { ...baseConfig, yAxisID: 'y1' })

      expect(lineDataset).toMatchObject({
        label: 'Fee %',
        type: 'line',
        borderColor: 'RED',
        backgroundColor: 'RED',
        yAxisID: 'y1',
        fill: false,
      })
      expect(lineDataset.data).toEqual({
        '04-24': 200,
        '05-24': 210,
        '06-24': 195,
      })
    })

    it('should handle missing data points gracefully', () => {
      const data = [
        { month: '04-24', feePercent: 200 },
        { month: '05-24' },
        { month: '06-24', feePercent: 195 },
      ]
      const lineDataset = getLineDatasetByKey(data, baseConfig)

      expect(lineDataset.data).toEqual({
        '04-24': 200,
        '05-24': 0,
        '06-24': 195,
      })
    })

    it('should default to y1 if yAxisID not provided', () => {
      const data = [{ month: '04-24', feePercent: 200 }]
      const lineDataset = getLineDatasetByKey(data, baseConfig)

      expect(lineDataset.yAxisID).toBe('y1')
    })

    it('should include all required line chart styling props', () => {
      const data = [{ month: '04-24', feePercent: 200 }]
      const lineDataset = getLineDatasetByKey(data, baseConfig)

      expect(lineDataset).toMatchObject({
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
        _legendColor: 'RED',
      })
    })
  })
})
