import _isNumber from 'lodash/isNumber'

const BTC_SATS = 100_000_000

/**
 * Calculate transaction sum (revenue and fees) from minerpool transactions
 * Based on API docs calculation
 * This function handles both transaction formats:
 * - changed_balance format (newer)
 * - satoshis_net_earned format (older)
 */
export const calculateTransactionSum = (
  transactions: Array<{
    changed_balance?: number
    satoshis_net_earned?: number
    fees_colected_satoshis?: number
    mining_extra?: { tx_fee?: number }
  }>,
): { revenueBTC: number; feesBTC: number } =>
  (transactions || []).reduce(
    (acc, tx) => {
      if (_isNumber(tx?.changed_balance)) {
        acc.revenueBTC += tx.changed_balance
        acc.feesBTC += tx.mining_extra?.tx_fee || 0
      } else if (_isNumber(tx?.satoshis_net_earned)) {
        acc.revenueBTC += tx.satoshis_net_earned / BTC_SATS
        acc.feesBTC += _isNumber(tx.fees_colected_satoshis)
          ? tx.fees_colected_satoshis / BTC_SATS
          : 0
      }
      return acc
    },
    { revenueBTC: 0, feesBTC: 0 },
  )
