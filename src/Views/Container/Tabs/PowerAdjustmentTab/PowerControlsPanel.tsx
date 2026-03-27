import { ErrorMessage, FormikProvider, useFormik } from 'formik'
import _compact from 'lodash/compact'
import _groupBy from 'lodash/groupBy'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _join from 'lodash/join'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _sortBy from 'lodash/sortBy'
import _uniq from 'lodash/uniq'
import pluralize from 'pluralize'
import { type FC, useEffect } from 'react'
import * as yup from 'yup'

import {
  ApplyButton,
  ControlsSection,
  ErrorMessageWrapper,
  InputLabel,
  ManualInputRow,
  ModelTitle,
  PanelContainer,
  PanelHeader,
  PercentageButton,
  PercentageButtonsRow,
  RackGroup,
  RackGroupTitle,
  RacksLabel,
  SectionLabel,
  SelectionSummary,
  SocketBadge,
  SocketBadgesRow,
  StyledInputNumber,
  SummaryTitle,
} from './PowerControlsPanel.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { NoMinersSelectedContainer } from '@/Components/Explorer/DetailsView/DetailsView.styles'
import NoDataSelected from '@/Components/Explorer/DetailsView/NoDataSelected/NoDataSelected'
import { UNITS } from '@/constants/units'

interface SelectedSocket {
  pduIndex: string
  socketIndex: string
}

interface PowerControlsPanelProps {
  selectedItems: Set<string>
  connectedMiners?: UnknownRecord[]
  containerInfo?: UnknownRecord
  onApply: (percentage: number, selectedSockets: SelectedSocket[]) => void
}

const MIN_POWER_PERCENTAGE = 0
const MAX_POWER_PERCENTAGE = 200
const PERCENTAGE_PRESETS = [0, 25, 50, 75, 100]

const powerPercentageSchema = yup.object({
  powerPercentage: yup
    .number()
    .nullable()
    .min(MIN_POWER_PERCENTAGE, `Minimum is ${MIN_POWER_PERCENTAGE}${UNITS.PERCENT}`)
    .max(MAX_POWER_PERCENTAGE, `Maximum is ${MAX_POWER_PERCENTAGE}${UNITS.PERCENT}`)
    .required('Power percentage is required'),
})

const PowerControlsPanel: FC<PowerControlsPanelProps> = ({
  selectedItems,
  connectedMiners,
  containerInfo,
  onApply,
}) => {
  const parseSelectedItems = (): SelectedSocket[] => {
    const itemsArray = Array.from(selectedItems)
    const parsed = _compact(
      _map(itemsArray, (item) => {
        try {
          return JSON.parse(item) as SelectedSocket
        } catch {
          return null
        }
      }),
    )
    return parsed
  }

  const selectedSockets = parseSelectedItems()
  const selectedCount = _size(selectedSockets)
  const hasSelection = selectedCount > 0

  const formik = useFormik({
    initialValues: {
      powerPercentage: null as number | null,
    },
    validationSchema: powerPercentageSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      if (values.powerPercentage !== null && hasSelection) {
        onApply(values.powerPercentage, selectedSockets)
      }
    },
  })

  // Reset percentage when selection is cleared
  useEffect(() => {
    if (!hasSelection) {
      formik.resetForm()
    }
  }, [hasSelection])

  // Get unique racks from selection
  const getSelectedRacks = (): string[] => {
    const racks = _map(selectedSockets, (socket) => socket.pduIndex)
    return _sortBy(_uniq(racks))
  }

  // Group sockets by rack
  const getSocketsByRack = (): Record<string, SelectedSocket[]> =>
    _groupBy(selectedSockets, 'pduIndex')

  // Get model name from first connected miner
  const getModelName = (): string => {
    if (!connectedMiners || _isEmpty(connectedMiners)) {
      return 'Whatsminer'
    }
    const firstMiner = _head(connectedMiners) as UnknownRecord | undefined
    const type = firstMiner?.type as string | undefined
    return type || 'Whatsminer'
  }

  const handlePercentageChange = (value: number | string | null) => {
    const numValue = typeof value === 'string' ? Number(value) : value
    formik.setFieldValue('powerPercentage', numValue)
    formik.setFieldTouched('powerPercentage', true, false)
  }

  const handlePresetClick = (preset: number) => {
    formik.setFieldValue('powerPercentage', preset)
    formik.setFieldTouched('powerPercentage', true, false)
  }

  const selectedRacks = getSelectedRacks()
  const socketsByRack = getSocketsByRack()
  const containerName = (containerInfo?.container as string) || 'Container'

  const isApplyDisabled =
    formik.values.powerPercentage === null || !formik.isValid || formik.isSubmitting

  if (!hasSelection) {
    return (
      <NoMinersSelectedContainer>
        <NoDataSelected text="No Selected" subtext="Please select to view details" />
      </NoMinersSelectedContainer>
    )
  }

  return (
    <FormikProvider value={formik}>
      <PanelContainer>
        <PanelHeader>
          <ModelTitle>{getModelName()}</ModelTitle>
          <RacksLabel>
            {_join(
              _map(selectedRacks, (rack) => `Rack ${rack}`),
              ' | ',
            )}
          </RacksLabel>
        </PanelHeader>

        <ControlsSection>
          <SectionLabel>Power Controls</SectionLabel>

          <ManualInputRow>
            <InputLabel>Manual Input</InputLabel>
            <StyledInputNumber
              value={formik.values.powerPercentage}
              onChange={handlePercentageChange}
              min={MIN_POWER_PERCENTAGE}
              max={MAX_POWER_PERCENTAGE}
              placeholder="Mixed"
              addonAfter={UNITS.PERCENT}
              status={
                formik.touched.powerPercentage && formik.errors.powerPercentage ? 'error' : ''
              }
            />
          </ManualInputRow>
          <ErrorMessageWrapper>
            <ErrorMessage name="powerPercentage" />
          </ErrorMessageWrapper>

          <PercentageButtonsRow>
            {_map(PERCENTAGE_PRESETS, (preset) => (
              <PercentageButton
                key={preset}
                $isActive={formik.values.powerPercentage === preset}
                onClick={() => handlePresetClick(preset)}
              >
                {preset}
                {UNITS.PERCENT}
              </PercentageButton>
            ))}
          </PercentageButtonsRow>

          <ApplyButton onClick={() => formik.handleSubmit()} disabled={isApplyDisabled}>
            Apply
          </ApplyButton>
        </ControlsSection>

        <SelectionSummary>
          <SummaryTitle>
            Selected {selectedCount} {pluralize('socket', selectedCount)} from {containerName}
          </SummaryTitle>

          {_map(_keys(socketsByRack), (rackId) => (
            <RackGroup key={rackId}>
              <RackGroupTitle>Rack {rackId}</RackGroupTitle>
              <SocketBadgesRow>
                {_map(_sortBy(socketsByRack[rackId], 'socketIndex'), (socket) => (
                  <SocketBadge key={`${socket.pduIndex}-${socket.socketIndex}`}>
                    Socket: {socket.socketIndex}
                  </SocketBadge>
                ))}
              </SocketBadgesRow>
            </RackGroup>
          ))}
        </SelectionSummary>
      </PanelContainer>
    </FormikProvider>
  )
}

export { PowerControlsPanel }
export type { SelectedSocket }
