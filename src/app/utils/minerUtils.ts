import {
  MINER_LOCATION_BG_COLORS,
  MINER_LOCATION_BORDER_COLORS,
  MINER_STATUS_BG_COLORS,
  MINER_STATUS_BORDER_COLORS,
} from '@/Components/Inventory/Miners/Miners.constants'

export interface LocationColors {
  $backgroundColor: string
  $borderColor: string
}

export interface StatusColors {
  $backgroundColor: string
  $borderColor: string
}

export const getLocationColors = (location: string): LocationColors => ({
  $backgroundColor:
    (MINER_LOCATION_BG_COLORS as Record<string, string | undefined>)[location] ?? 'none',
  $borderColor:
    (MINER_LOCATION_BORDER_COLORS as Record<string, string | undefined>)[location] ?? 'grey',
})

export const getStatusColors = (status: string): StatusColors => ({
  $backgroundColor:
    (MINER_STATUS_BG_COLORS as Record<string, string | undefined>)[status] ?? 'none',
  $borderColor:
    (MINER_STATUS_BORDER_COLORS as Record<string, string | undefined>)[status] ?? 'grey',
})
