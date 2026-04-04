import { Calendar as AppCalendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import moment from 'moment';
import { useMemo, useState } from 'react';

type ScheduleCalendarModalProps = {
    schedules: any[];
    iconSize?: number;
    variant?: any;
}
export default function ScheduleCalendarModal({ schedules, iconSize, variant }: ScheduleCalendarModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const schedulesByDay = useMemo(() => {
        const grouped = new Map<string, any[]>();

        schedules?.forEach((schedule: any) => {
            const dateField = schedule.schedules || schedule.created_at;
            if (!dateField) return;

            const dayKey = moment(dateField).format('YYYY-MM-DD');
            const list = grouped.get(dayKey) || [];
            list.push(schedule);
            grouped.set(dayKey, list);
        });

        return grouped;
    }, [schedules]);

    const calendarDaysWithVisits = useMemo(() => {
        return Array.from(schedulesByDay.keys()).map((dayKey) => moment(dayKey, 'YYYY-MM-DD').toDate());
    }, [schedulesByDay]);

    const selectedDateKey = selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : '';
    const selectedDateVisits = selectedDateKey ? schedulesByDay.get(selectedDateKey) || [] : [];

    return (
        <Dialog>
            <DialogTrigger className="flex h-full cursor-pointer items-center justify-center" title='Agendamentos'>
                <Calendar size={iconSize} className="text-primary" />
            </DialogTrigger>

            <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Calendário de visitas</DialogTitle>
                    <DialogDescription>
                        Visualização dos agendamentos exibidos nesta página. Dias com visitas ficam destacados em azul.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <div className="flex justify-center">
                        <AppCalendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            modifiers={{ hasVisit: calendarDaysWithVisits }}
                            modifiersClassNames={{
                                hasVisit: 'font-semibold text-blue-700 underline decoration-blue-500 decoration-2 underline-offset-4',
                            }}
                            className="rounded-md border"
                        />
                    </div>

                    <div className="rounded-md border p-4">
                        <h4 className="mb-3 text-sm font-semibold">
                            {selectedDate ? `Visitas em ${moment(selectedDate).format('DD/MM/YYYY')}` : 'Selecione um dia'}
                        </h4>

                        {selectedDateVisits.length === 0 ? (
                            <p className="text-sm text-gray-500">Nenhuma visita agendada para este dia.</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {selectedDateVisits
                                    .slice()
                                    .sort((a: any, b: any) => {
                                        const dateA = moment(a.schedules || a.created_at);
                                        const dateB = moment(b.schedules || b.created_at);
                                        return dateA.valueOf() - dateB.valueOf();
                                    })
                                    .map((schedule: any) => (
                                        <div key={schedule.id} className="rounded-md border bg-gray-50 p-3 text-sm">
                                            <div className="font-medium text-gray-900">
                                                {moment(schedule.schedules || schedule.created_at).format('HH:mm')}
                                            </div>
                                            <div className="text-gray-700">
                                                {schedule.customer?.name || schedule.name || 'Cliente não informado'}
                                            </div>
                                            {schedule.service && (
                                                <div className="text-xs text-gray-500">{schedule.service}</div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
