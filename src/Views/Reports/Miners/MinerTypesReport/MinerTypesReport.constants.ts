export const MINER_TYPES_REPORT_FILTER_OPTIONS = [
  {
    label: 'All Miners',
    value: 'ALL',
    tailLogKey: 'type_cnt',
  },
  {
    label: 'Miners Offline',
    value: 'OFFLINE',
    tailLogKey: 'offline_type_cnt',
  },
  {
    label: 'Miners in Maintenance',
    value: 'MAINTENANCE',
    tailLogKey: 'maintenance_type_cnt',
  },
]
