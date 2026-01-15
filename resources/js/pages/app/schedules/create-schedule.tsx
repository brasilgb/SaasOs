import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Calendar, Save } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskCep, maskPhone } from "@/Utils/mask";
import Select from 'react-select';
import InputError from "@/components/input-error";
import { statusAgenda } from "@/Utils/dataSelect";
import ScheduleForm from "./schedule-form";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Agendamentos',
    href: route('app.schedules.index'),
  },
  {
    title: 'Adicionar',
    href: '#',
  },
];

export default function CreateSchedule({ customers, technicals }: any) {
  
  return (
    <AppLayout>
      <Head title="Agendamentos" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Calendar} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Agendamentos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.schedules.index')}
            >
              <ArrowLeft h-4 w-4 />
              <span>Voltar</span>
            </Link>
          </Button>
        </div>
        <div>
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg p-2'>

          <ScheduleForm customers={customers} technicals={technicals} />

        </div>
      </div >
    </AppLayout >
  )
}
