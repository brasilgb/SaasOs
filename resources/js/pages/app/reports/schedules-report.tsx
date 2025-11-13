import React from 'react'

interface OrderReportProps {
    dateRange: { from?: Date; to?: Date };
}

function SchedulesReport({ dateRange }: OrderReportProps) {
  return (
    <div>SchedulesReport</div>
  )
}

export default SchedulesReport
