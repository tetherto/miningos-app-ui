import Divider from 'antd/es/divider'

import type { Device } from '@/app/utils/deviceUtils'
import { getContainerSpecificStats } from '@/app/utils/deviceUtils'
import { DEVICE_STATUS } from '@/app/utils/statusUtils'
import { DeviceStatus } from '@/Components/DeviceStatus/DeviceStatus'
import { CompactUnitControlBox } from '@/Components/Explorer/Containers/BitMainImmersion/UnitControlBox/CompactUnitControlBox'
import PumpStationControlBox from '@/Components/Explorer/Containers/BitMainImmersion/UnitControlBox/PumpStationControlBox'
import { UnitControlBox } from '@/Components/Explorer/Containers/BitMainImmersion/UnitControlBox/UnitControlBox'
import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'

interface BitMainImmersionSecondaryDataProps {
  data: Device
  isBitmain?: boolean
}

const BitMainImmersionSecondaryData = ({
  data,
  isBitmain = true,
}: BitMainImmersionSecondaryDataProps) => {
  const containerSpecific = getContainerSpecificStats(data)

  return (
    <>
      <ContainerPanel $noWrap>
        <PumpStationControlBox
          title="Pump Station"
          alarmStatus={containerSpecific?.pump_alarm}
          ready={containerSpecific?.pump_ready}
          operation={containerSpecific?.pump_operation}
          start={containerSpecific?.pump_start}
        />
        <Divider size="small" />
        <DeviceStatus
          isRow
          status={containerSpecific?.second_pump1 ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
          fault={(containerSpecific?.second_pump1_fault && DEVICE_STATUS.ERROR) as string | boolean}
          title={isBitmain ? 'Oil Pump #1' : '#1 Secondary pump'}
        />
        <DeviceStatus
          isRow
          status={containerSpecific?.second_pump2 ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
          fault={(containerSpecific?.second_pump2_fault && DEVICE_STATUS.ERROR) as string | boolean}
          title={isBitmain ? 'Oil Pump #2' : '#2 Secondary pump'}
        />
        <Divider size="small" />
        <UnitControlBox
          title="Water Pump"
          alarmStatus={containerSpecific?.primary_circulating_pump as boolean}
          frequency={containerSpecific?.feedback_fre as number}
          running={containerSpecific?.one_pump as boolean}
          showFrequencyInLeftColumn
          secondary
        />
      </ContainerPanel>
      <ContainerPanel>
        <UnitControlBox
          title="Constant Speed Dry Cooler"
          alarmStatus={containerSpecific?.dry_cooler_power_fre_fault}
          running={containerSpecific?.dry_cooler_power_freq_run}
          showFrequencyInLeftColumn
          isDryCooler
          secondary
        />
        <Divider size="small" />
        <UnitControlBox
          title="Variable Speed Dry Cooler"
          alarmStatus={containerSpecific?.dry_cooler_fre_conv}
          frequency={containerSpecific?.drycooler_freq}
          running={!containerSpecific?.dry_cooler_fre_conv}
          isDryCooler
          showFrequencyInLeftColumn
          secondary
        />
        <Divider size="small" />
        <CompactUnitControlBox
          title="CV01"
          opening={containerSpecific?.valve1_open as boolean}
          closing={containerSpecific?.valve1_close as boolean}
          isOpen={containerSpecific?.open1 as boolean}
        />
        <CompactUnitControlBox
          title="CV02"
          opening={containerSpecific?.valve2_open as boolean}
          closing={containerSpecific?.valve2_close as boolean}
          isOpen={containerSpecific?.open2 as boolean}
        />
      </ContainerPanel>
    </>
  )
}

export default BitMainImmersionSecondaryData
