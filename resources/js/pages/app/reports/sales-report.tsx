
import React from 'react'

interface OrderReportProps {
    dateRange: { from?: Date; to?: Date };
}

function SalesReport({ dateRange }: OrderReportProps) {
  return (
    <div>SalesReport</div>
  )
}

export default SalesReport