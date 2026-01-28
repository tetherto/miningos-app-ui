export const columnItems = [
  // { key: 'miner_serial', label: 'Miner Serial Number' },
  // { key: 'miner_position', label: 'Miner Position' },
  // { key: 'miner_container', label: 'Miner Container Info' },
  { key: 'ip', label: 'IP Address' },
  { key: 'status', label: 'Status' },
  { key: 'type', label: 'Miner Type' },
  { key: 'power', label: 'Power' },
  { key: 'version', label: 'Version Info' },
  { key: 'mac', label: 'MAC Address' },
  { key: 'err', label: 'Error Code' },
  { key: 'uptime', label: 'Uptime / Elapsed' },
  {
    key: 'powerMode',
    label: 'Power Mode',
    children: [
      { key: 'powerMode.performance', label: 'Performance' },
      { key: 'powerMode.ths', label: 'Ths Rt' },
      { key: 'powerMode.efficiency', label: 'Efficiency' },
    ],
  },
  {
    key: 'hashTemp',
    label: 'Temp / Volt',
    children: [
      { key: 'hashTemp.hashTemp', label: 'Hash Temp' },
      { key: 'hashTemp.envTemp', label: 'Env Temp' },
      { key: 'hashTemp.chipTemp', label: 'Chip Temp' },
      { key: 'hashTemp.volt', label: 'Volt' },
    ],
  },
  {
    key: 'network',
    label: 'Network Info',
    children: [
      { key: 'network.fastboot', label: 'FastBoot' },
      { key: 'network.rejectRate', label: 'Reject Rate' },
    ],
  },
  {
    key: 'pools',
    label: 'Active Pool',
    children: [
      { key: 'pools.activePool', label: 'Active Pool' },
      { key: 'pools.pool1', label: 'Pool 1' },
      { key: 'pools.worker1', label: 'Worker 1' },
      { key: 'pools.pool2', label: 'Pool 2' },
      { key: 'pools.worker2', label: 'Worker 2' },
      { key: 'pools.pool3', label: 'Pool 3' },
      { key: 'pools.worker3', label: 'Worker 3' },
    ],
  },
]
