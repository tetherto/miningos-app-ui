import { DeleteOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Empty from 'antd/es/empty'
import Input from 'antd/es/input'
import Row from 'antd/es/row'
import Switch from 'antd/es/switch'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _reduce from 'lodash/reduce'
import _split from 'lodash/split'
import _trim from 'lodash/trim'
import React, { useEffect, useState } from 'react'

import { useGetFeaturesQuery } from '../../../app/services/api'
import { useAddFeatureFlagsMutation } from '../../../app/services/api'
import { getErrorMessage } from '../../../app/utils/actionUtils'
import { notifyError, notifySuccess } from '../../../app/utils/NotificationService'
import { useIsFeatureEditingEnabled } from '../../../hooks/usePermissions'
import { PrimaryButton } from '../../ActionsSidebar/ActionCard/ActionCard.styles'

import {
  AddFeatureFlagsContainer,
  ColSwitcher,
  DeleteIconContainer,
  FeatureFlagsOuterContainer,
  FeatureTogglesContainer,
  SaveFeatureFlagsContainer,
  StyledCol,
} from './FeatureFlagsSettings.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

const FeatureFlagsSettings = () => {
  const {
    data: featureFlags,
    isLoading: isFeatureFlagsLoading,
    refetch,
  } = useGetFeaturesQuery(undefined)
  const [featureFlagsData, setFeatureFlagsData] = useState<UnknownRecord>({})

  const [addFeatureFlags, { isLoading: isAddingFeatureFlags }] = useAddFeatureFlagsMutation()

  const [newFeatureFlag, setNewFeatureFlag] = useState('')

  useEffect(() => {
    setFeatureFlagsData((_omit(featureFlags as UnknownRecord, '') || {}) as UnknownRecord)
  }, [featureFlags])

  const onToggleChange = (flag: string, checked: boolean) => {
    const features = { ...featureFlagsData } as UnknownRecord
    features[flag] = checked
    setFeatureFlagsData(features)
  }

  const onSaveClicked = async () => {
    const { data, error } = await addFeatureFlags({ data: featureFlagsData })
    if ((data as UnknownRecord)?.success) {
      notifySuccess('Submitted feature flags', 'Feature flags updated successfully')
      refetch()
    } else {
      const errorMessage = getErrorMessage(
        data,
        error as { data?: { message?: string }; message?: string } | undefined,
      )
      notifyError('Error occurred while submission', errorMessage || 'Unknown error')
    }
  }

  if (!useIsFeatureEditingEnabled()) {
    return <Empty description="Update feature flags not enabled" />
  }

  const onFeatureFlagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFeatureFlag(e.target.value)
  }
  const onAddFeatureFlag = () => {
    if (!newFeatureFlag) return
    const features = _reduce(
      _split(newFeatureFlag, ','),
      (prev: UnknownRecord, flag: string) => {
        const trimmedFlag = _trim(flag)
        if (trimmedFlag) return { ...prev, [trimmedFlag]: false }
        return prev
      },
      featureFlagsData,
    )
    setFeatureFlagsData(features)
    setNewFeatureFlag('')
  }
  const onDeleteFeatureFlag = (flag: string) => {
    setFeatureFlagsData(_omit(featureFlagsData, flag) as UnknownRecord)
  }
  return (
    <FeatureFlagsOuterContainer>
      <Row>
        <Col xl={12} lg={18} md={24} xs={24}>
          <AddFeatureFlagsContainer>
            <Input
              placeholder="Add new feature flag, Use comma seperated values for multiple flags"
              onChange={onFeatureFlagsInputChange}
              value={newFeatureFlag}
            />
            <Button disabled={!newFeatureFlag} size="middle" onClick={onAddFeatureFlag}>
              Add flag
            </Button>
          </AddFeatureFlagsContainer>
        </Col>
      </Row>

      <FeatureTogglesContainer>
        <Row gutter={[20, 20]}>
          {_map(_keys(featureFlagsData), (flag: string) => (
            <StyledCol key={flag} xs={24} md={16} lg={12} xl={8}>
              <Row>
                <Col xs={18} lg={12}>
                  {flag}
                </Col>
                <ColSwitcher xs={5} lg={4}>
                  <Switch
                    size="small"
                    checked={Boolean(featureFlagsData[flag])}
                    onChange={(checked: boolean) => onToggleChange(flag, checked)}
                  />
                </ColSwitcher>
                <Col xs={1} lg={4}>
                  <DeleteIconContainer onClick={() => onDeleteFeatureFlag(flag)}>
                    <DeleteOutlined />
                  </DeleteIconContainer>
                </Col>
              </Row>
            </StyledCol>
          ))}
        </Row>

        <SaveFeatureFlagsContainer>
          <PrimaryButton
            disabled={isAddingFeatureFlags || isFeatureFlagsLoading}
            onClick={onSaveClicked}
          >
            Save
          </PrimaryButton>
        </SaveFeatureFlagsContainer>
      </FeatureTogglesContainer>
    </FeatureFlagsOuterContainer>
  )
}

export default FeatureFlagsSettings
