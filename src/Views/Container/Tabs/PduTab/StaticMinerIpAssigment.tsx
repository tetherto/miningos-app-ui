import Col from 'antd/es/col'
import Input from 'antd/es/input'
import type { ChangeEvent } from 'react'
import { Dispatch, SetStateAction } from 'react'

import { InputTitle } from '@/Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.styles'

interface StaticMinerIpAssigmentProps {
  setMinerIp: Dispatch<SetStateAction<string>>
  isStaticIpAssignment?: boolean
  minerIp: string
  forceSetIp: boolean
  isChangeInfo: boolean
}

export const StaticMinerIpAssigment = ({
  setMinerIp,
  isStaticIpAssignment,
  minerIp,
  forceSetIp,
  isChangeInfo,
}: StaticMinerIpAssigmentProps) => {
  const onIpInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMinerIp(String(e?.target?.value))
  }
  return (
    <>
      {isStaticIpAssignment && (!isChangeInfo || forceSetIp) && (
        <Col span={24}>
          <InputTitle>Changed Miner IP Address</InputTitle>
          <Input
            title="Miner Ip"
            value={minerIp}
            onChange={onIpInputChange}
            disabled={!forceSetIp}
          />
        </Col>
      )}
    </>
  )
}
