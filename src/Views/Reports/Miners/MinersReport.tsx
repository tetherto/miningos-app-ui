import { PageTitle } from '../Reports.styles'

import { MinersReportRoot } from './MinersReport.styles'
import MinerTypesReport from './MinerTypesReport/MinerTypesReport'

const MinersReport = () => (
  <MinersReportRoot>
    <PageTitle>Miners</PageTitle>
    <MinerTypesReport />
  </MinersReportRoot>
)

export default MinersReport
