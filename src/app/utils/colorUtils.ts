import _trimStart from 'lodash/trimStart'

import { CATEGORICAL_COLORS } from '../../constants/colors'

import { circularArrayAccess } from './sharedUtils'

export const normalizeHexColor = (color: string): string => _trimStart(color, '#')

export const createCategoricalColorGen = () => circularArrayAccess(CATEGORICAL_COLORS)
