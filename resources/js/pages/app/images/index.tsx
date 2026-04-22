import { toastSuccess, toastWarning } from '@/components/app-toast-messages';
import { Breadcrumbs } from '@/components/breadcrumbs';
import HeadingSmall from '@/components/heading-small';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Wrench } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

interface ImageData {
    file: File;
    preview: string;
    id: string;
}

const MAX_IMAGES = 4;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Ordens',
        href: route('app.orders.index'),
    },
    {
        title: 'Imagens',
        href: '#',
    },
];
const ImageUpload = ({ savedimages, orderid, ordernumber, errors }: any) => {
    const [fileKey, setFileKey] = useState(0);

    const {
        data,
        post,
        delete: destroy,
        processing,
        setData,
        reset,
    } = useForm({
        images: [] as File[],
        order_id: orderid as string,
    });

    const [imagePreviews, setImagePreviews] = useState<ImageData[]>([]);

    /* =========================
       HANDLE FILE CHANGE
    ========================= */
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        if (files.some((file) => !file.type.startsWith('image/'))) {
            toastWarning('Erro', 'Apenas imagens são permitidas.');
            e.target.value = '';
            return;
        }

        const savedCount = savedimages.length;
        const currentCount = data.images.length;
        const total = savedCount + currentCount + files.length;

        if (total > MAX_IMAGES) {
            toastWarning('Erro', `Esta ordem pode ter no máximo ${MAX_IMAGES} imagens no total.`);
            e.target.value = '';
            return;
        }

        const previews = files.map((file) => {
            const preview = URL.createObjectURL(file);
            return { file, preview, id: preview };
        });

        setImagePreviews((prev) => [...prev, ...previews]);
        setData('images', [...data.images, ...files]);
    };

    /* =========================
       REMOVE PREVIEW IMAGE
    ========================= */
    const handleRemoveImage = (id: string) => {
        setImagePreviews((prev) => prev.filter((img) => img.id !== id));

        setData(
            'images',
            data.images.filter((_, index) => imagePreviews[index]?.id !== id),
        );
    };

    /* =========================
       SUBMIT
    ========================= */
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (data.images.length === 0) {
            toastWarning('Erro', 'Selecione ao menos uma imagem.');
            return;
        }

        post(route('app.images.store'), {
            forceFormData: true,
            onSuccess: () => {
                toastSuccess('Sucesso', 'Imagens enviadas com sucesso.');
                reset();
                setImagePreviews([]);
                setFileKey((prev) => prev + 1);
            },
            onError: (errs) => {
                Object.values(errs).forEach((msg) => {
                    toastWarning('Erro', String(msg));
                });
            },
        });
    };

    /* =========================
       DELETE IMAGE FROM DB
    ========================= */
    const handleDeleteImageBanco = (id: number) => {
        destroy(route('app.images.destroy', id));
    };

    /* =========================
       CLEAN OBJECT URLS
    ========================= */
    useEffect(() => {
        return () => {
            imagePreviews.forEach((img) => URL.revokeObjectURL(img.preview));
        };
    }, [imagePreviews]);

    return (
        <AppLayout>
            <Head title="Imagens da Ordem" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Wrench} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Imagens</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.orders.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div></div>
            </div>
            <div className="p-4">
                <div className="rounded-lg border p-4">
                    <HeadingSmall title="Imagens da Ordem de Serviço" description={`Envie até ${MAX_IMAGES} imagens.`} />

                    <form onSubmit={handleSubmit} className="mt-4">
                        <input
                            key={fileKey}
                            type="file"
                            name="images[]"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full rounded border p-2"
                        />

                        {errors?.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}

                        {/* PREVIEWS */}
                        {imagePreviews.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                                {imagePreviews.map((img) => (
                                    <div key={img.id} className="relative">
                                        <img src={img.preview} className="h-32 w-full rounded object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(img.id)}
                                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* IMAGENS SALVAS */}
                        {savedimages?.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                                {savedimages.map((img: any) => (
                                    <div key={img.id} className="relative">
                                        <img src={`/storage/orders/${ordernumber ?? orderid}/${img.filename}`} className="h-32 w-full rounded object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImageBanco(img.id)}
                                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-xs text-white"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2" />
                                Salvar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default ImageUpload;
