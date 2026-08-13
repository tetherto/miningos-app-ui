import { COLOR } from '@/constants/colors'

export const tableColumns = [
  {
    title: 'State',
    dataIndex: 'state',
    key: 'state',
    width: '20%',
  },
  {
    title: 'Range',
    dataIndex: 'range',
    key: 'range',
    width: '25%',
  },
  {
    title: 'Color',
    dataIndex: 'color',
    key: 'color',
    width: '15%',
  },
  {
    title: 'Flash',
    dataIndex: 'flash',
    key: 'flash',
    width: '20%',
    align: 'center',
  },
  {
    title: 'Sound',
    dataIndex: 'sound',
    key: 'sound',
    width: '20%',
    align: 'center',
  },
]

export const getCommonColorMapping = () => ({
  [COLOR.RED]: { text: 'Red', background: COLOR.DARK_RED, textColor: COLOR.RED },
  [COLOR.BRICK_RED]: { text: 'Red', background: COLOR.BRICK_RED, textColor: COLOR.WHITE },
  [COLOR.ORANGE]: { text: 'Orange', background: COLOR.DARK_ORANGE, textColor: COLOR.LIGHT_ORANGE },
  [COLOR.COLD_ORANGE]: {
    text: 'Orange',
    background: COLOR.DARK_ORANGE,
    textColor: COLOR.LIGHT_ORANGE,
  },
  [COLOR.GREEN]: { text: 'Green', background: COLOR.DARK_GREEN, textColor: COLOR.GREEN },
  [COLOR.LIGHT_GREEN]: {
    text: 'Green',
    background: COLOR.LIGHT_GREEN,
    textColor: COLOR.SIMPLE_BLACK,
  },
  [COLOR.GRASS_GREEN]: {
    text: 'Green',
    background: COLOR.DARK_GREEN,
    textColor: COLOR.GREEN,
  },
  [COLOR.YELLOW]: {
    text: 'Yellow',
    background: COLOR.DARK_YELLOW,
    textColor: COLOR.ORANGE_WARNING,
  },
  [COLOR.YELLOW_DARK]: {
    text: 'Yellow',
    background: COLOR.DARK_YELLOW,
    textColor: COLOR.ORANGE_WARNING,
  },
  [COLOR.GOLD]: {
    text: 'Yellow',
    background: COLOR.DARK_YELLOW,
    textColor: COLOR.GOLD,
  },
  [COLOR.WHITE]: { text: 'White', background: COLOR.WHITE, textColor: COLOR.SIMPLE_BLACK },
})

export const getCommonTableColumns = () => [
  { title: 'State', dataIndex: 'state', key: 'state', width: '20%' },
  { title: 'Range', dataIndex: 'range', key: 'range', width: '25%' },
  { title: 'Color', dataIndex: 'color', key: 'color', width: '15%' },
  { title: 'Flash', dataIndex: 'flash', key: 'flash', width: '20%' },
  { title: 'Sound', dataIndex: 'sound', key: 'sound', width: '20%' },
]
