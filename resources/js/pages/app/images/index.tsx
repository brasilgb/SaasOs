import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BreadcrumbItem, PageProps } from '@/types'; // Assuming you have a types.d.ts for PageProps
import AppLayout from '@/layouts/app-layout';
import AlertSuccess from '@/components/app-alert-success';
import { Save, Wrench } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import HeadingSmall from '@/components/heading-small';

interface ImageData {
    file: File;
    preview: string;
    id: string; // Unique ID for key prop
}

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
        href: "#",
    },
];

const ImageUpload: React.FC<PageProps> = ({ savedimages, orderid, errors, success, error }: any) => {

    const { flash } = usePage().props as any;
    const { data, post, delete: destroy, processing, setData } = useForm({
        images: [] as File[],
        order_id: orderid as string,
    });

    const [imagePreviews, setImagePreviews] = useState<ImageData[]>([]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const newImagePreviews: ImageData[] = filesArray.map((file) => ({
                file: file,
                preview: URL.createObjectURL(file),
                id: URL.createObjectURL(file), // Use object URL as a unique ID for now
            }));

            setImagePreviews((prev) => [...prev, ...newImagePreviews]);
            setData('images', [...data.images, ...filesArray]);
        }
    };

    const handleRemoveImage = (idToRemove: string) => {
        setImagePreviews((prev) => prev.filter((image) => image.id !== idToRemove));
        setData('images', data.images.filter((file, index) => imagePreviews[index]?.id !== idToRemove));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('app.images.store'));
        setImagePreviews([]);
    };

    const handleDeletaImageBanco = (id:any) => {
        destroy(route("app.images.destroy", id));
    }

    return (
        <AppLayout>
            {flash.message && <AlertSuccess message={flash.message} />}
            {flash.error && <AlertSuccess message={flash.error} />}
            <Head title="Imagens de Ordens" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Wrench} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Ordens</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg'>

                    <div className="container mx-auto p-4">

                        <div className='flex items-center justify-between'>
                            <div className='pb-4'>
                                <HeadingSmall
                                    title="Imagens para ordens de serviço"
                                    description="Cadastre imagens de equipamentos."
                                />
                            </div>
                            <div>
                                <h1 className='text-lg'>Ordem#<span>{orderid}</span></h1>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Erro!</strong>
                                <span className="block sm:inline"> {error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="images" className="block text-gray-700 text-sm font-bold mb-2">
                                    Selecione Imagens:
                                </label>
                                <input
                                    type="file"
                                    id="images"
                                    name="images[]"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                                {errors.images && <p className="text-red-500 text-xs italic">{errors.images}</p>}
                            </div>

                            {savedimages.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-2">Imagens disponíveis no banco:</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {savedimages.map((img: any) => (
                                            <div key={img.id} className="relative group">
                                                <img
                                                    src={`/storage/orders/${orderid}/${img.filename}`}
                                                    alt="Preview"
                                                    className="w-full h-32 object-cover rounded shadow-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletaImageBanco(img.id)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-4 w-4 items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remover imagem"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {imagePreviews.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-2">Pré-visualização:</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {imagePreviews.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <img
                                                    src={image.preview}
                                                    alt="Preview"
                                                    className="w-full h-32 object-cover rounded shadow-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(image.id)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-4 w-4 items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remover imagem"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    <Save />
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout >
    );
};

export default ImageUpload;