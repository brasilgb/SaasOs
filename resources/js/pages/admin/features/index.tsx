import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin/admin-layout';
import type { BreadcrumbItem, PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Palette } from 'lucide-react';
import moment from 'moment';
import CreateFeature from './create-feature';
import EditPlan from './edit-feature';

interface Period {
    id: number;
    name: string;
}

interface Feature {
    id: number;
    name: string;
    order: number | string;
    created_at: string;
    period: Period;
}

interface PaginatedData<T> {
    data: T[];
    current_page?: number;
    last_page?: number;
    links?: Array<Record<string, unknown>>;
}

interface FeaturesIndexProps {
    features: PaginatedData<Feature>;
    periods: Period[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Características',
        href: '#',
    },
];

export default function PlansIndex({ features, periods }: FeaturesIndexProps) {
    const { flash } = usePage<PageProps<{ flash?: { message?: string } }>>().props;

    return (
        <AdminLayout>
            <Head title="Características" />
            {flash?.message && <AlertSuccess message={flash.message} />}
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Palette} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Características</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex items-center justify-between p-4">
                <div>
                    <InputSearch placeholder="Buscar característica" url="admin.features.index" />
                </div>
                <div>
                    <CreateFeature periods={periods} />
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Períod</TableHead>
                                <TableHead>order</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {features.data.length > 0 ? (
                                features.data.map((feature) => (
                                    <TableRow key={feature.id}>
                                        <TableCell>{feature.id}</TableCell>
                                        <TableCell>{feature.name}</TableCell>
                                        <TableCell>{feature.period.name}</TableCell>
                                        <TableCell>{feature.order}</TableCell>
                                        <TableCell>{moment(feature.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            <EditPlan feature={feature} periods={periods} />
                                            <ActionDelete title={'esta característica'} url={'admin.features.destroy'} param={feature.id} />
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
                                    <AppPagination data={features} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
}
