import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Edit, ImageUp, Pencil, Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AlertSuccess from '@/components/app-alert-success';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import moment from 'moment';
import { statusOrdemByValue } from '@/Utils/functions';
import ModalReceipt from '../receipts/modal-receipt';
import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import InputSearch from '@/components/inputSearch';
import SelectFilter from '@/components/SelectFilter';
import { Switch } from '@/components/ui/switch';
import { maskPhone } from '@/Utils/mask';
import { statusServico } from '@/Utils/dataSelect';
import { TemplateSenderWhatsapp } from '@/components/template-sender-whatsapp';
import { getGreeting } from '@/components/greeting';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/',
    },
    {
        title: 'Ordens',
        href: '/orders',
    },
];

export default function Orders({ orders, whats, feedback }: any) {
    const { flash, ziggy } = usePage().props as any;
    const { cl, init } = (ziggy as any).query

    const stylesOrderStatus = (value: any) => {
        switch (value) {
            case 1:
                return "bg-gray-300/90 border border-gray-300 !text-white text-xs uppercase";
            case 2:
                return "bg-cyan-600/90 border border-cyan-600 !text-white text-xs uppercase";
            case 3:
                return "bg-orange-600/90 border border-orange-600 !text-white text-xs uppercase";
            case 4:
                return "bg-sky-600/90 border border-sky-600 !text-white text-xs uppercase";
            case 5:
                return "bg-red-600/90 border border-red-600 !text-white text-xs uppercase";
            case 6:
                return "bg-green-600/90 border border-green-600 !text-white text-xs uppercase";
            case 7:
                return "bg-green-600/90 border border-green-600 !text-white text-xs uppercase";
            case 8:
                return "bg-blue-600/90 border border-blue-600 !text-white text-xs uppercase";
        }
    };

    const handleFeedbackCheck = (value: number, id: number) => {
        const newValue = value === 1 ? 0 : 1;
        router.get(route('app.orders.feedback', { "feedback": newValue, "orderid": id }))
    }

    return (
        <AppLayout>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Ordens" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Wrench} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Ordens</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className='flex items-center justify-between p-4'>
                <div className='w-full'>
                    <InputSearch placeholder="Buscar ordem por número, nome do cliente ou cpf/cnpj" url="app.orders.index" />
                </div>
                <div className='w-full flex justify-end'>
                    <SelectFilter dataStatus={statusServico} url="app.orders.index" />
                </div>
                <div className='w-full flex justify-end'>
                    <Button variant={'default'} asChild>
                        <Link
                            href={route('app.orders.create')}
                        >
                            <Plus className='h-4 w-4' />
                            <span>Ordem</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Recebimento</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Modelo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Entrega</TableHead>
                                <TableHead>Feedback</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.data.length > 0 ?
                                orders?.data?.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.order_number}</TableCell>
                                        <TableCell className="font-medium">
                                            <Link className="flex items-center gap-2" href={route('app.orders.index', { oc: order.customer_id })}
                                                title={`Ordens do cliente ${order.customer.name}`}>
                                                <Wrench className="w-4 h-4" />
                                                <span>{order.customer.name}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-medium">{maskPhone(order.customer.phone)}</TableCell>
                                        <TableCell>{moment(order.created_at).format("DD/MM/YYYY")}</TableCell>
                                        <TableCell>{order.equipment.equipment}</TableCell>
                                        <TableCell>{order.model}</TableCell>
                                        <TableCell>{<span className={`px-3 py-1 rounded-full font-medium ${stylesOrderStatus(order.service_status)}`}>{statusOrdemByValue(order.service_status)}</span>}</TableCell>
                                        <TableCell>{order.delivery_date ? moment(order.delivery_date).format("DD/MM/YYYY") : ''}</TableCell>
                                        <TableCell>
                                            {feedback.filter((or: any) => or.id === order.id).length > 0 && (
                                                <Switch
                                                    checked={order.feedback}
                                                    onCheckedChange={() => handleFeedbackCheck(order.feedback, order.id)}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className='flex justify-end gap-2'>

                                            <TemplateSenderWhatsapp
                                                phone={order.customer.phone}
                                                template={`${order.service_status == '7' ? whats?.servicecompleted : order.service_status == '3' ? whats?.generatedbudget : "Olá, cliente!"}`}
                                                data={{
                                                    greeting: getGreeting(),
                                                    name: order.customer.name,
                                                    os: order.order_number,
                                                    value: `${order.service_status == '7' ? order?.service_cost : order.service_status == '3' ? order?.budget_value : "0,00"}`
                                                }}
                                            />

                                            <ModalReceipt orderid={order.id} />
                                            <Button asChild size="icon" className="bg-fuchsia-700 hover:bg-fuchsia-700 text-white">
                                                <Link href={route('app.images.index', { or: order.id })}>
                                                    <ImageUp className="h-4 w-4" />
                                                </Link>
                                            </Button>

                                            <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                                                <Link href={route('app.orders.edit', order.id)} data={{ page: orders.current_page, cl: cl, init: init ?? init }} >
                                                    <Edit />
                                                </Link>
                                            </Button>

                                            <ActionDelete title={'esta ordem'} url={'app.orders.destroy'} param={order.id} />

                                        </TableCell>
                                    </TableRow>
                                ))
                                : (
                                    <TableRow>
                                        <TableCell colSpan={9} className='h-16 w-full flex items-center justify-center'>
                                            Não há dados a serem mostrados no momento.
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={10}>
                                    <AppPagination data={orders} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    )
}
