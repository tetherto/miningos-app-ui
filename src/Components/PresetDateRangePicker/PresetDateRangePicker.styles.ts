import Modal from 'antd/es/modal'
import { css, styled } from 'styled-components'

interface StyledProps {
  $isActive?: boolean
}

import { flexCenterRow, flexColumn, flexRow, flexRowReverse } from '@/app/mixins'
import DateFnsDatePicker from '@/Components/DatePicker/DatePicker'
import { COLOR } from '@/constants/colors'

const panelModalMajorGap = '16px'

const pickerHeaderNavSize = '32px'

const pickerHeaderNavIconOffset = '4px'

const pickerPanelTitleSpace = '20px'

const panelInnerGap = '12px'

const panelScrollbarWidth = '4px'

const presetsListWidth = '100px'

const basicContentStyles = css`
  margin-left: auto;
  width: min(580px, 100%) !important;
`

const activeMixin = css`
  background-color: ${COLOR.COLD_ORANGE_ALPHA_02};
  color: ${COLOR.COLD_ORANGE};
  border-color: ${COLOR.TRANSPARENT};
`

export const PresetDateRangePickerRoot = styled(DateFnsDatePicker.RangePicker)<StyledProps>`
  max-width: 245px;
  max-height: 40px;
  min-height: 40px;
  width: fit-content;
  padding: 8px 12px;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  border-radius: 0;

  &,
  & * {
    cursor: pointer;
  }

  .ant-picker-input > input {
    field-sizing: content !important;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  .ant-picker-active-bar {
    display: none !important;
  }

  ${(props) => props.$isActive && activeMixin};

  &:focus,
  &:focus-within,
  &:hover {
    ${activeMixin};
  }
`

export const PresetDateRangePickerModal = styled(Modal)<StyledProps>`
  .ant-picker-date-panel-container > .ant-modal-root > .ant-modal-wrap > &.ant-modal {
    width: fit-content !important;
    max-width: 90dvw !important;
    border: 1px solid ${COLOR.WHITE_ALPHA_01} !important;
    background-color: ${COLOR.EBONY} !important;

    .ant-modal-content {
      ${flexColumn};
      gap: ${panelModalMajorGap};
      padding: ${panelModalMajorGap};
      background-color: ${COLOR.TRANSPARENT};

      .ant-modal-header {
        padding-bottom: ${panelModalMajorGap};
        background-color: ${COLOR.TRANSPARENT};
        border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
        margin-bottom: 0;

        .ant-modal-title {
          font-size: 18px;
          font-style: normal;
          font-weight: 400;
          line-height: 18px;
        }
      }

      & > .ant-modal-footer {
        ${flexRowReverse};
        gap: ${panelModalMajorGap};
        margin-top: 0 !important;
        ${basicContentStyles}

        & > .ant-btn {
          flex: 1;
          padding: 8px 4px !important;

          & + .ant-btn.marginless-action {
            margin-inline-start: 0 !important;
          }

          &:disabled {
            opacity: 0.5 !important;
          }
        }
      }
    }
  }
`

export const PresetDateRangePickerPanel = styled.div<StyledProps>`
  ${flexColumn};
  gap: ${panelModalMajorGap};
  max-height: 50dvh !important;
  overflow-y: auto;
  margin-right: -${panelScrollbarWidth};
  padding-right: ${panelScrollbarWidth};

  &::-webkit-scrollbar {
    width: ${panelScrollbarWidth} !important;
  }

  .ant-picker-panel-layout {
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: ${panelModalMajorGap};

    .ant-picker-presets {
      min-width: initial;
      width: ${presetsListWidth};

      ul {
        height: fit-content !important;
        width: fit-content !important;
        padding: 0 !important;
        border-inline-end: none !important;

        li {
          padding: 0 !important;
        }
      }
    }

    .ant-picker-panels {
      flex-wrap: wrap !important;
      justify-content: center !important;
      gap: ${panelModalMajorGap};

      .ant-picker-panel {
        position: relative;
        border: 1px solid ${COLOR.WHITE_ALPHA_01} !important;
        background-color: ${COLOR.BLACK_ALPHA_05};
        padding: ${panelInnerGap} !important;
        margin-top: ${pickerPanelTitleSpace};

        &:before {
          position: absolute;
          left: 0;
          top: -${pickerPanelTitleSpace};
          font-size: 12px;
          font-style: normal;
          font-weight: 800;
          line-height: 14px;
          letter-spacing: 1.32px;
          text-transform: uppercase;
          color: ${COLOR.WHITE_ALPHA_05};
        }

        &:first-child:before {
          content: 'start date';
        }

        &:last-child:before {
          content: 'end date';
        }

        .ant-picker-date-panel {
          width: 256px;
          gap: 8px;

          .ant-picker-header {
            ${flexCenterRow};
            border-bottom: none !important;
            padding: 0 !important;

            .ant-picker-header-view {
              &,
              & * {
                line-height: normal;
                pointer-events: none !important;
              }
            }

            .ant-picker-header-prev-btn,
            .ant-picker-header-next-btn {
              ${flexCenterRow};
              width: ${pickerHeaderNavSize};
              height: ${pickerHeaderNavSize};
              background-color: ${COLOR.EBONY};
              border: 1px solid ${COLOR.WHITE_ALPHA_01};
            }

            .ant-picker-header-prev-btn {
              padding-left: ${pickerHeaderNavIconOffset};
            }

            .ant-picker-header-next-btn {
              padding-right: ${pickerHeaderNavIconOffset};
            }
          }

          .ant-picker-body {
            padding: 0 !important;

            .ant-picker-content {
              border-collapse: separate;
              border-spacing: 0 4px;

              th {
                font-size: 12px;
                font-style: normal;
                font-weight: 400;
                line-height: normal;
                color: ${COLOR.WHITE_ALPHA_05};
              }

              .ant-picker-cell {
                padding: 0 !important;
                height: 24px !important;

                &:before {
                  height: 100% !important;
                }

                &:after {
                  position: absolute;
                  top: 50%;
                  inset-inline-start: 0;
                  inset-inline-end: 0;
                  z-index: 1;
                  height: 100%;
                  transform: translateY(-50%);
                  content: '';
                  pointer-events: none;
                  box-sizing: border-box;
                  border: 2px solid ${COLOR.OBSIDIAN};
                  border-top: 0;
                  border-bottom: 0;
                }

                .ant-picker-cell-inner {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 0 !important;
                  width: 32px !important;
                  height: 100% !important;

                  &:before {
                    border-radius: 0 !important;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export const PresetDateRangePickerMeta = styled.div<StyledProps>`
  ${flexRow};
  flex-wrap: wrap;
  ${basicContentStyles}
  gap: ${panelModalMajorGap};
  box-sizing: border-box;

  & > * {
    flex: 1;
    min-width: min(250px, 80dvw);
  }
`

export const PresetDateRangePickerPresets = styled.div<StyledProps>`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: ${panelInnerGap};
  background-color: ${COLOR.OBSIDIAN};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const PresetDateRangePickerSummary = styled.div<StyledProps>`
  ${flexColumn};
  box-sizing: border-box;
  padding: ${panelInnerGap};
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: ${COLOR.WHITE_ALPHA_05};
  background-color: ${COLOR.OBSIDIAN};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const PresetDateRangePickerSummaryTitle = styled.span<StyledProps>`
  font-size: 12px;
  letter-spacing: 0.6px;
`

export const PresetDateRangePickerSummarySelection = styled.div<StyledProps>`
  ${flexRow};
  gap: 8px;
`

export const PresetDateRangePickerSummarySelectionPart = styled.span<StyledProps>`
  color: ${COLOR.COLD_ORANGE};
`
