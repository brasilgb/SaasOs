import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, Edit, Plus, X } from 'lucide-react';
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
import { unMask } from '@/Utils/mask';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Agenda',
        href: '#',
    },
];

function getWhatsappPhone(value: string) {
    const digits = unMask(value ?? '');
    if (!digits) return '';

    // Se vier apenas DDD + número, adiciona DDI do Brasil.
    if (digits.length === 10 || digits.length === 11) {
        return `55${digits}`;
    }

    return digits;
}

function getTechnicianWhatsappMessage(schedule: any) {
    const visitDate = moment(schedule.schedules).format('DD/MM/YYYY HH:mm');
    const greetingHour = new Date().getHours();
    const greeting = greetingHour < 12 ? 'Bom dia' : greetingHour < 18 ? 'Boa tarde' : 'Boa noite';

    const addressParts = [
        schedule.customer?.street,
        schedule.customer?.number,
        schedule.customer?.complement,
        schedule.customer?.district,
        schedule.customer?.city,
    ].filter(Boolean);

    return [
        `${greeting}, ${schedule.user?.name}!`,
        `Visita agendada para ${visitDate}.`,
        `Serviço: ${schedule.service}.`,
        `Cliente: ${schedule.customer?.name}.`,
        `Endereço: ${addressParts.join(', ')}.`,
    ].join('\n');
}

export default function Schedules({ schedules, search, status }: any) {
    const { auth } = usePage<{ auth?: { role?: string; permissions?: string[] } }>().props;
    const hasActiveFilters = Boolean(search || status);
    const canManageSchedules = auth?.role !== 'technician' && auth?.permissions?.includes('schedules');

    return (
        <AppLayout>
            <Head title="Agenda" />
            <div className="flex min-h-16 flex-col justify-center gap-3 px-4 py-3 sm:py-0">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Calendar} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Agenda</h2>
                </div>
                <div className="min-w-0 self-start sm:self-auto">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar por serviço, cliente ou cpf/cnpj" url="app.schedules.index" />
                </div>
                <div className="flex w-full flex-col gap-2 md:flex-row lg:w-auto lg:shrink-0">
                    <SelectFilter dataStatus={statusAgenda} url="app.schedules.index" noOrder />
                    {hasActiveFilters && (
                        <Button variant={'outline'} asChild className="w-full whitespace-nowrap md:w-auto">
                            <Link href={route('app.schedules.index')}>
                                <X className="mr-1 h-4 w-4" />
                                <span>Limpar filtros</span>
                            </Link>
                        </Button>
                    )}
                </div>
                <div className="flex w-full flex-col gap-2 md:flex-row lg:w-auto lg:shrink-0 lg:justify-end">
                    <ScheduleCalendarModal iconSize={38} schedules={schedules?.data || []} />

                    {canManageSchedules && (
                        <Button variant={'default'} asChild className="w-full whitespace-nowrap md:w-auto">
                            <Link href={route('app.schedules.create')}>
                                <Plus className="h-4 w-4" />
                                <span>Novo agendamento</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Visita</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Técnico</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="min-w-[140px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules?.data.length > 0 ? (
                                schedules?.data?.map((schedule: any) => (
                                    <TableRow key={schedule.id}>
                                        <TableCell>{schedule.schedules_number}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{schedule.customer.name}</div>
                                                <div className="text-muted-foreground text-xs">
                                                    Solicitado em {moment(schedule.created_at).format('DD/MM/YYYY')}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{moment(schedule.schedules).format('DD/MM/YYYY')}</div>
                                                <div className="text-muted-foreground text-xs">{moment(schedule.schedules).format('HH:mm')}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{schedule.service}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{schedule.user.name}</div>
                                                <div className="text-muted-foreground text-xs">Técnico responsável</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge category="agenda" value={schedule.status} />
                                        </TableCell>
                                        <TableCell className="min-w-[140px]">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {canManageSchedules && (
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        className="bg-green-500 text-white hover:bg-green-500"
                                                        title="Enviar WhatsApp"
                                                    >
                                                        <a
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href={`https://wa.me/${getWhatsappPhone(schedule.user?.whatsapp ?? '')}?text=${encodeURIComponent(getTechnicianWhatsappMessage(schedule))}`}
                                                            aria-label={`Enviar WhatsApp para ${schedule.user?.name}`}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="16"
                                                                height="16"
                                                                fill="currentColor"
                                                                className="bi bi-whatsapp"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.240-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.330.065-.134.034-.248-.015-.347-.050-.099-.445-1.076-.612-1.47-.160-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.710 1.916.810 2.049c.098.133 1.394 2.132 3.383 2.992.470.205.840.326 1.129.418.475.152.904.129 1.246.080.38-.058 1.171-.480 1.338-.943.164-.464.164-.860.114-.943-.049-.084-.182-.133-.38-.232" />
                                                            </svg>
                                                        </a>
                                                    </Button>
                                                )}

                                                <Button
                                                    asChild
                                                    size="icon"
                                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                                    title="Editar agendamento"
                                                >
                                                    <Link
                                                        href={route('app.schedules.edit', schedule.id)}
                                                        data={{ page: schedules.current_page, search: search }}
                                                        aria-label={`Editar agendamento ${schedule.schedules_number}`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                {canManageSchedules && (
                                                    <ActionDelete title={'este agendamento'} url={'app.schedules.destroy'} param={schedule.id} />
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={7}>
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
