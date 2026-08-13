import _toLower from 'lodash/toLower'
import _toUpper from 'lodash/toUpper'
import _values from 'lodash/values'

import type { ParsedAlertEntry } from './Alerts.util'
import { applyAlertsLocalFilters } from './Alerts.util'
import type { LocalFilters } from './CurrentAlerts/CurrentAlerts'

const TYPE = {
  alpha: 'Alpha',
  beta: 'Beta',
  gamma: 'Gamma',
} as const

const TYPE_UPPERCASED = {
  alpha: _toUpper(TYPE.alpha),
  beta: _toUpper(TYPE.beta),
  gamma: _toUpper(TYPE.gamma),
} as const

const TYPE_LOWERCASED = {
  alpha: _toLower(TYPE.alpha),
  beta: _toLower(TYPE.beta),
  gamma: _toLower(TYPE.gamma),
} as const

const STATUS = {
  x: 'Xxx',
  y: 'Yyy',
  z: 'Zzz',
} as const

const SEVERITY = {
  top: 'Top',
  mid: 'Mid',
  low: 'Low',
} as const

const ALERTS_MAP: Record<
  string,
  Pick<ParsedAlertEntry, 'type' | 'alertName' | 'status' | 'severity'>
> = {
  a: {
    type: '',
    alertName: TYPE.alpha,
    status: STATUS.x,
    severity: SEVERITY.top,
  },
  b: {
    type: TYPE.gamma,
    alertName: '',
    status: STATUS.y,
    severity: SEVERITY.top,
  },
  c: {
    type: '',
    alertName: TYPE.gamma,
    status: STATUS.z,
    severity: SEVERITY.mid,
  },
  d: {
    type: TYPE.beta,
    alertName: '',
    status: STATUS.y,
    severity: SEVERITY.mid,
  },
  e: {
    type: '',
    alertName: TYPE.alpha,
    status: STATUS.x,
    severity: SEVERITY.low,
  },
}

const ALERTS_ARR = _values(ALERTS_MAP) as ParsedAlertEntry[]

describe('Alert utils', () => {
  describe("Apply alerts' local filters", () => {
    test('should filter by Severity', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          severity: [SEVERITY.top, SEVERITY.low],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.a, ALERTS_MAP.b, ALERTS_MAP.e])
    })

    test('should filter by Status', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          status: [STATUS.y, STATUS.z],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.b, ALERTS_MAP.c, ALERTS_MAP.d])
    })

    test('should filter by both Severity & Status', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          severity: [SEVERITY.mid, SEVERITY.low],
          status: [STATUS.y],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.d])
    })

    test('should filter by Type', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          type: [TYPE.alpha, TYPE.gamma],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.a, ALERTS_MAP.b, ALERTS_MAP.c, ALERTS_MAP.e])
    })

    test('should filter by Type case-insensitively (UPPERCASE mode)', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          type: [TYPE_UPPERCASED.alpha, TYPE_UPPERCASED.gamma],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.a, ALERTS_MAP.b, ALERTS_MAP.c, ALERTS_MAP.e])
    })

    test('should filter by Type case-insensitively (LOWERCASE mode)', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          type: [TYPE_LOWERCASED.alpha, TYPE_LOWERCASED.gamma],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.a, ALERTS_MAP.b, ALERTS_MAP.c, ALERTS_MAP.e])
    })

    test('should filter by Type case-insensitively (MiXeD mode)', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          type: [TYPE_UPPERCASED.alpha, TYPE_LOWERCASED.gamma],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.a, ALERTS_MAP.b, ALERTS_MAP.c, ALERTS_MAP.e])
    })

    test('should filter by Type #2', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          type: [TYPE.alpha, TYPE.beta],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.a, ALERTS_MAP.d, ALERTS_MAP.e])
    })

    test('should filter by Type #2 case-insensitively (UPPERCASE mode)', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          type: [TYPE_UPPERCASED.alpha, TYPE_UPPERCASED.beta],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.a, ALERTS_MAP.d, ALERTS_MAP.e])
    })

    test('should filter by Type #2 case-insensitively (lowercase mode)', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          type: [TYPE_LOWERCASED.alpha, TYPE_LOWERCASED.beta],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.a, ALERTS_MAP.d, ALERTS_MAP.e])
    })

    test('should filter by Type #2 case-insensitively (MiXeD mode)', () => {
      expect(
        applyAlertsLocalFilters(ALERTS_ARR, {
          type: [TYPE_UPPERCASED.alpha, TYPE_LOWERCASED.beta],
        } as LocalFilters),
      ).toEqual([ALERTS_MAP.a, ALERTS_MAP.d, ALERTS_MAP.e])
    })
  })
})
