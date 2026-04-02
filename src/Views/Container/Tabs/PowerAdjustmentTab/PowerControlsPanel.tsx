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
  RackGroup,
  RackGroupTitle,
  RacksLabel,
  SectionLabel,
  SelectionSummary,
  SocketBadge,
  SocketBadgesRow,
  StyledInputNumber,
  StyledSlider,
  SummaryTitle,
} from './PowerControlsPanel.styles'

import { getConnectedMinerForSocket } from '@/app/utils/containerUtils'
import { NoMinersSelectedContainer } from '@/Components/Explorer/DetailsView/DetailsView.styles'
import NoDataSelected from '@/Components/Explorer/DetailsView/NoDataSelected/NoDataSelected'
import { UNITS } from '@/constants/units'
import type { Device } from '@/types'

interface SelectedSocket {
  pduIndex: string
  socketIndex: string
}

interface ContainerInfo {
  container?: string
  [key: string]: unknown
}

interface PowerControlsPanelProps {
  selectedItems: Set<string>
  connectedMiners?: Device[]
  containerInfo?: ContainerInfo
  onApply: (percentage: number, selectedSockets: SelectedSocket[]) => void
}

const MIN_POWER_PERCENTAGE = 0
const MAX_POWER_PERCENTAGE = 200
const SLIDER_MARKS: Record<number, string> = {
  0: '0%',
  40: '40%',
  80: '80%',
  120: '120%',
  160: '160%',
  200: '200%',
}

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
    onSubmit: (values, { setSubmitting }) => {
      if (values.powerPercentage !== null && hasSelection) {
        onApply(values.powerPercentage, selectedSockets)
      }
      setSubmitting(false)
    },
  })

  // Pre-fill percentage from selected miners or reset when cleared
  useEffect(() => {
    if (!hasSelection) {
      formik.resetForm()
      return
    }

    const powerPctValues = _compact(
      _map(selectedSockets, (socket) => {
        const miner = getConnectedMinerForSocket(
          (connectedMiners || []) as Device[],
          socket.pduIndex,
          socket.socketIndex,
        ) as
          | { last?: { snap?: { stats?: { miner_specific?: { power_pct?: number } } } } }
          | undefined
        return miner?.last?.snap?.stats?.miner_specific?.power_pct
      }),
    )

    if (powerPctValues.length > 0 && _uniq(powerPctValues).length === 1) {
      formik.setFieldValue('powerPercentage', powerPctValues[0])
    } else {
      formik.setFieldValue('powerPercentage', null)
    }
  }, [selectedItems])

  // Get unique racks from selection
  const getSelectedRacks = (): string[] => {
    const racks = _map(selectedSockets, (socket) => socket.pduIndex)
    return _sortBy(_uniq(racks))
  }

  // Group sockets by rack
  const getSocketsByRack = (): Record<string, SelectedSocket[]> =>
    _groupBy(selectedSockets, 'pduIndex')

  const getModelName = (): string => {
    if (!connectedMiners || _isEmpty(connectedMiners)) {
      return 'Whatsminer'
    }
    const firstMiner = _head(connectedMiners)
    return firstMiner?.type || 'Whatsminer'
  }

  const handlePercentageChange = (value: number | string | null) => {
    const numValue = typeof value === 'string' ? Number(value) : value
    formik.setFieldValue('powerPercentage', numValue)
    formik.setFieldTouched('powerPercentage', true, false)
  }

  const handleSliderChange = (value: number) => {
    formik.setFieldValue('powerPercentage', value)
    formik.setFieldTouched('powerPercentage', true, false)
  }

  const selectedRacks = getSelectedRacks()
  const socketsByRack = getSocketsByRack()
  const containerName = containerInfo?.container || 'Container'

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
              placeholder="Mixed"
              addonAfter={UNITS.PERCENT}
              status={
                formik.touched.powerPercentage && formik.errors.powerPercentage ? 'error' : ''
              }
            />
          </ManualInputRow>
          {formik.touched.powerPercentage && formik.errors.powerPercentage && (
            <ErrorMessageWrapper>
              <ErrorMessage name="powerPercentage" />
            </ErrorMessageWrapper>
          )}

          <StyledSlider
            min={MIN_POWER_PERCENTAGE}
            max={MAX_POWER_PERCENTAGE}
            marks={SLIDER_MARKS}
            value={formik.values.powerPercentage ?? 0}
            onChange={handleSliderChange}
            tooltip={{ formatter: (value) => `${value}${UNITS.PERCENT}` }}
          />

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
