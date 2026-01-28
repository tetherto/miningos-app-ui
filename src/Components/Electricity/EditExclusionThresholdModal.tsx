import { InfoCircleFilled } from '@ant-design/icons'
import Button from 'antd/es/button'
import Tooltip from 'antd/es/tooltip'
import { FormikProvider, useFormik } from 'formik'
import _toFinite from 'lodash/toFinite'
import { FC } from 'react'
import * as yup from 'yup'

import { FormActions, ModalBody, ModalTitle, StyledModal } from './styles'

import { useSetSiteEnergyGlobalDataMutation } from '@/app/services/api'
import { Logger } from '@/app/services/logger'
import { formatNumber } from '@/app/utils/format'
import { notifyError, notifyInfo } from '@/app/utils/NotificationService'
import { FormikInput } from '@/Components/FormInputs'

const MAX_SITE_ENERGY_EXCLUSION_THRESHOLD = 1e5

interface EditExclusionThresholdModalProps {
  isOpen?: boolean
  onClose?: () => void
  threshold?: number
  site?: string
}

const EditExclusionThresholdModal: FC<EditExclusionThresholdModalProps> = ({
  isOpen,
  onClose,
  threshold,
  site,
}) => {
  const [setSiteEnergyGlobalData] = useSetSiteEnergyGlobalDataMutation()
  const formik = useFormik({
    initialValues: {
      threshold: formatNumber((threshold ?? 0) * 1000),
    },
    validationSchema: yup.object({
      threshold: yup
        .number()
        .min(0)
        .max(MAX_SITE_ENERGY_EXCLUSION_THRESHOLD)
        .required('Threshold is required'),
    }),
    onSubmit: async ({ threshold }) => {
      try {
        await setSiteEnergyGlobalData({
          data: {
            energyExclusionThresholdMwh: _toFinite(Number(threshold) / 1000),
            site,
          },
        })

        notifyInfo('Success', 'Threshold updated')
        onClose?.()
      } catch (error) {
        notifyError('Error', 'Unable to update the threshold')
        Logger.error(error as string)
      }
    },
  })

  return (
    <StyledModal
      title={<ModalTitle>Edit Energy Exclusion Threshold</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={400}
      maskClosable={false}
    >
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            <FormikInput
              name="threshold"
              placeholder="Exclusion Threshold in KWH"
              suffix={
                <Tooltip title="Exclusion Threshold in KWH">
                  <Button ghost type="text" shape="circle" icon={<InfoCircleFilled />}></Button>
                </Tooltip>
              }
            />
            <FormActions>
              <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                Save
              </Button>
              <Button onClick={onClose} disabled={formik.isSubmitting}>
                Cancel
              </Button>
            </FormActions>
          </ModalBody>
        </form>
      </FormikProvider>
    </StyledModal>
  )
}

export default EditExclusionThresholdModal
