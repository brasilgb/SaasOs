import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, Plus } from 'lucide-react';
import moment from 'moment';

import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import InputSearch from '@/components/inputSearch';
import ScheduleCalendarModal from '@/components/Schedules/ScheduleCalendarModal';
import SelectFilter from '@/components/SelectFilter';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { statusAgenda } from '@/Utils/dataSelect';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Agendamentos',
        href: '#',
    },
];

export default function Schedules({ schedules, search }: any) {
    return (
        <AppLayout>
            <Head title="Agendamentos" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Calendar} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Agendamentos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:max-w-sm">
                    <InputSearch placeholder="Buscar por serviço, nome do cliente ecpf/cnpj" url="app.schedules.index" />
                </div>
                <div className="w-full md:w-auto">
                    <SelectFilter dataStatus={statusAgenda} url="app.schedules.index" noOrder />
                </div>
                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:justify-end">
                    <ScheduleCalendarModal iconSize={38} schedules={schedules?.data || []} />

                    <Button variant={'default'} asChild className="w-full md:w-auto">
                        <Link href={route('app.schedules.create')}>
                            <Plus className="h-4 w-4" />
                            <span>Novo Agendamento</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Horário da visita</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Técnico</TableHead>
                                <TableHead>Solicitação</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules?.data.length > 0 ? (
                                schedules?.data?.map((schedule: any) => (
                                    <TableRow key={schedule.id}>
                                        <TableCell>{schedule.schedules_number}</TableCell>
                                        <TableCell>{schedule.customer.name}</TableCell>
                                        <TableCell>{moment(schedule.schedules).format('DD/MM/YYYY HH:mm')}</TableCell>
                                        <TableCell>{schedule.service}</TableCell>
                                        <TableCell>
                                            <StatusBadge category="agenda" value={schedule.status} />
                                        </TableCell>
                                        <TableCell>{schedule.user.name}</TableCell>
                                        <TableCell>{moment(schedule.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            <Button asChild size="icon" className="bg-green-500 text-white hover:bg-green-500">
                                                <a
                                                    target="_blank"
                                                    href={`https://wa.me/${schedule.user.whatsapp}?text=Olá, ${schedule.user?.name} - ${moment(schedule.schedules).format('DD/MM/YYYY H:m')} - ${schedule.service} - ${schedule.customer.street}, ${schedule.customer.number}, ${schedule.customer.complement}, ${schedule.customer.district}, ${schedule.customer.city}`}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-whatsapp"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                                                    </svg>
                                                </a>
                                            </Button>

                                            <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600">
                                                <Link
                                                    href={route('app.schedules.edit', schedule.id)}
                                                    data={{ page: schedules.current_page, search: search }}
                                                >
                                                    <Edit />
                                                </Link>
                                            </Button>

                                            <ActionDelete title={'este agendamento'} url={'app.schedules.destroy'} param={schedule.id} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <AppPagination data={schedules} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
