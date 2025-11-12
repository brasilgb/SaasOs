import { Breadcrumbs } from "@/components/breadcrumbs";
import { DatePicker } from "@/components/date-picker";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { FileTextIcon, Search } from "lucide-react";
import moment from "moment";
import { useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Vendas',
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
          <h2 className="text-xl font-semibold tracking-tight">Vendas</h2>
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
              <DatePicker dateRange={dateRange} setDateRange={setDateRange} />
            </CardContent>
          <CardContent className="flex flex-grow items-start justify-start gap-4">
              <Button variant={'default'} onClick={handleReportCustomer}>
                Relatório de clientes
              </Button>
              <Button variant={'default'} onClick={handleReportCustomer}>
                Relatório de ordens
              </Button>
              <Button variant={'default'} onClick={handleReportCustomer}>
                Relatório de agendamentos
              </Button>
              <Button variant={'default'} onClick={handleReportCustomer}>
                Relatório de vendas
              </Button>
              <Button variant={'default'} onClick={handleReportCustomer}>
                Relatório de peças/produtos
              </Button>
          </CardContent>

        </Card>
      </div>

    </AppLayout>
  )
}