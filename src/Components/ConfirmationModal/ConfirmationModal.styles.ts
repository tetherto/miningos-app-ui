import Modal from 'antd/es/modal'
import styled, { css } from 'styled-components'

interface StyledProps {
  $centered?: boolean
}

import { flexColumn } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

export const ModalContent = styled.main<StyledProps>`
  font-size: 14px;
  font-weight: 400;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const ConfirmationModalHead = styled(Modal)<StyledProps>`
  ${(props) =>
    props.$centered
      ? css`
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `
      : css`
          top: 0;
          right: 0;
          bottom: 0;
          height: 50dvh;

          .ant-modal-content {
            height: 100dvh;
          }
        `};
  position: fixed;
  justify-content: space-between;
  padding: 0;
  width: 20%;
  ${flexColumn};

  .ant-modal-content {
    border-radius: 0;
    overflow-y: auto !important;
    background-color: ${COLOR.BLACK};
  }

  .ant-modal-title {
    background-color: ${COLOR.SIMPLE_BLACK};
    text-transform: capitalize;
  }

  .ant-modal-footer {
    margin-top: 24px;

    .ant-btn-default {
      font-size: 14px;
      font-weight: 500;
      box-shadow: none !important;
      color: ${COLOR.WHITE_ALPHA_08} !important;
      border: 1px solid ${COLOR.WHITE_ALPHA_02} !important;
      padding: 19px 25px;

      &:hover {
        border-color: ${COLOR.ORANGE_BORDER} !important;
      }
    }

    .ant-btn-primary {
      font-size: 14px;
      font-weight: 500;
      box-shadow: none !important;
      color: ${COLOR.SIMPLE_BLACK} !important;
      padding: 19px 25px;

      &:hover {
        background:
          linear-gradient(0deg, ${COLOR.WHITE_ALPHA_026} 0%, ${COLOR.WHITE_ALPHA_026} 100%),
          ${COLOR.ORANGE} !important;
      }
    }
  }
`
