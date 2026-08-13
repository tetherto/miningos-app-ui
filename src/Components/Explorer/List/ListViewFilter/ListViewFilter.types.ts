export type FilterSelectionValue = string | number | boolean

export type FilterSelection = FilterSelectionValue[]

export type FilterSelectionTuple = FilterSelection & [string, string, string?]

export interface CascaderOption {
  label: string
  order?: number
  tab?: string[]
  value: FilterSelectionValue
  children?: CascaderOption[]
}
