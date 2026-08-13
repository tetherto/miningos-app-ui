export const HEATMAP_MODE = {
  INLET: 'inlet',
  PCB: 'pcb',
  CHIP: 'chip',
  HASHRATE: 'hashrate',
} as const

// Type exports
export type HeatmapModeKey = keyof typeof HEATMAP_MODE
export type HeatmapModeValue = (typeof HEATMAP_MODE)[HeatmapModeKey]
