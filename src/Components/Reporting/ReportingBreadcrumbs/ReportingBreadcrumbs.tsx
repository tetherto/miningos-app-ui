import { ReloadOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Tooltip from 'antd/es/tooltip'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useTimezone from '../../../hooks/useTimezone'
import { Breadcrumbs } from '../../Breadcrumbs/Breadcrumbs'

import { BreadcrumbsWrapper, IconWrapper } from './ReportingBreadcrumbs.styles'

interface ReportingBreadcrumbsProps {
  title: string
  useGoBack?: boolean
  destination?: string
  onRefresh?: () => void
  useRefresh?: boolean
}

const ReportingBreadcrumbs = ({
  title,
  useGoBack = false,
  destination = '/reporting-tool',
  onRefresh = () => {},
  useRefresh = true,
}: ReportingBreadcrumbsProps) => {
  const { timezone, getFormattedDate } = useTimezone()
  const navigate = useNavigate()
  const now = new Date()
  const [dateInfo, setDateInfo] = useState('')

  useEffect(() => {
    const formatted = {
      date: getFormattedDate(now, undefined, 'dd/MM/yy'),
      time: getFormattedDate(now, undefined, 'HH:mm:ss'),
    }
    setDateInfo(`Data updated last on ${formatted.date} at ${formatted.time}`)
  }, [timezone])

  const tooltip = (
    <div>
      <p>Refresh data.</p>
      <div>{dateInfo}</div>
    </div>
  )

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
      return
    }
    navigate(0)
  }

  return (
    <BreadcrumbsWrapper>
      <Breadcrumbs title={title} useGoBack={useGoBack} destination={destination} />
      {useRefresh && (
        <IconWrapper>
          <Tooltip placement="bottomLeft" title={tooltip}>
            <Button size="middle" onClick={handleRefresh}>
              <ReloadOutlined />
            </Button>
          </Tooltip>
        </IconWrapper>
      )}
    </BreadcrumbsWrapper>
  )
}

export { ReportingBreadcrumbs }
