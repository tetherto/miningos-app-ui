import styled from 'styled-components'

import { flexCenterColumn, flexColumn, flexRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const DeviceLabelText = styled.div`
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 25px;
  padding: 5px;
`
export const ContainerLabelText = styled(DeviceLabelText)`
  color: ${COLOR.COLD_ORANGE};
  text-decoration: underline;
  text-underline-offset: 3px;
  text-transform: uppercase;
`

export const MaintenanceContainerLabeltext = styled(ContainerLabelText)`
  color: ${COLOR.YELLOW};
  text-decoration: none;
`

export const DetailsViewContainer = styled.div`
  ${flexColumn};
  padding: 0px;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 10px;

  @media (min-width: 992px) {
    min-width: 100%;
    box-sizing: border-box;
    margin-bottom: 40px;
  }
`

export const NoMinersSelectedContainer = styled.div`
  gap: 20px;
  text-align: center;
  height: 100%;
  ${flexCenterColumn};

  @media (max-width: 1300px) {
    min-width: unset;
  }
`
export const ItemTitleRow = styled.div`
  ${flexRow};
  gap: 10px;
  padding: 10px;
  justify-content: space-between;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  background: ${COLOR.EBONY};
`

export const ScrollableDetailsContent = styled.div`
  padding: 0 5px 0 0;

  & > * {
    margin-bottom: 10px;
  }
`
