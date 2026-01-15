import { Breadcrumbs } from "@/components/breadcrumbs";
import { DatePicker } from "@/components/date-picker";
import { Icon } from "@/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { FileTextIcon } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import CustomersReport from "./customers-report";
import OrdersReport from "./orders-report";
import SchedulesReport from "./schedules-report";
import SalesReport from "./sales-report";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Relatórios',
    href: '#',
  },
];

export default function Sales({ sales }: any) {

  const [dateRange, setDateRange] = useState<any>({
    from: new Date(),
    to: new Date(),
  });

  const handleReportCustomer = () => {
    const formattedDateFrom = moment(dateRange.from).format('YYYY-MM-DD');
    const formattedDateTo = moment(dateRange.to).format('YYYY-MM-DD');
    console.log('Relatório de clientes', formattedDateFrom, formattedDateTo);
  }


  return (
    <AppLayout>
      <Head title="Relatórios" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={FileTextIcon} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Relatórios</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Selecione um intervalo de datas e um módulo para gerar o relatório.</CardTitle>
          </CardHeader>
          <CardContent>
            <DatePicker mode={'range'} setDate={setDateRange} date={dateRange} />
          </CardContent>
          <CardContent className="flex flex-wrap items-start justify-start gap-4">
            <OrdersReport dateRange={dateRange} />
            <CustomersReport dateRange={dateRange} />
            <SchedulesReport dateRange={dateRange} />
            <SalesReport dateRange={dateRange} />
          </CardContent>

        </Card>
      </div>

    </AppLayout>
  )
}