import _endsWith from 'lodash/endsWith'
import _head from 'lodash/head'
import _mapValues from 'lodash/mapValues'
import _minBy from 'lodash/minBy'
import _startsWith from 'lodash/startsWith'
import _toPairs from 'lodash/toPairs'

/**
 * @param {Object} [payload]
 * {
 *    avg: 0,
 *    t_30s: 0,
 *    t_1m: 0,
 *    t_5m: 0,
 *    t_15m: 0
 *  }
 * @returns {String}  t_30s smallest time attribute of all the attributes
 */
export const getAttributeWithSmallestTime = (data: Record<string, number>): string | undefined => {
  const seconds = _mapValues(data, (value, key) => {
    if (!_startsWith(key, 't_')) return Infinity
    const timeframe = key.slice(2)
    if (_endsWith(timeframe, 'm')) return parseFloat(timeframe) * 60
    if (_endsWith(timeframe, 's')) return parseFloat(timeframe)
    return Infinity
  })
  return _head(_minBy(_toPairs(seconds), ([, value]) => value)) as string | undefined
}
