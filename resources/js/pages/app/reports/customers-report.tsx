
import React from 'react'

interface OrderReportProps {
    dateRange: { from?: Date; to?: Date };
}

function CustomersReport({ dateRange }: OrderReportProps) {
  return (
    <div>CustomersReport</div>
  )
}

export default CustomersReport