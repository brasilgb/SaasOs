import { toastSuccess } from '@/components/app-toast-messages';
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useZipcodeAutocomplete } from '@/hooks/useZipcodeAutocomplete';
import { Customer } from '@/types';
import { maskCep, maskCpfCnpj, maskPhone, unMask } from '@/Utils/mask';
import { useForm } from '@inertiajs/react';
import { Loader2Icon, Save, Search } from 'lucide-react';
import { useState } from 'react';

export default function CustomerForm({ initialData }: { initialData?: Customer }) {
    const isEdit = !!initialData;

    const [zipcodeToSearch, setZipcodeToSearch] = useState<string | null>(null);

    const { data, setData, post, processing, reset, setError, clearErrors, errors, put } = useForm<Customer>(initialData || ({} as Customer));

    const handleCreate = () => {
        post(route('app.customers.store'), {
            onSuccess: () => {
                toastSuccess('Cliente salvo', 'Cadastro realizado com sucesso');
                reset();
            },
        });
    };

    const handleUpdate = () => {
        put(route('app.customers.update', initialData!.id), {
            onSuccess: () => {
                toastSuccess('Cliente alterado', 'Edição realizada com sucesso');
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            handleUpdate();
        } else {
            handleCreate();
        }
    };

    const { isZipcodeLoading } = useZipcodeAutocomplete<Customer>({
        zipcode: zipcodeToSearch || '',
        paths: {
            zipcode: 'zipcode',
            state: 'state',
            city: 'city',
            district: 'district',
            street: 'street',
            complement: 'complement',
        },
        setData: (key: any, value: any) => {
            if (zipcodeToSearch !== null) {
                setData(key, value);
            }
        },
        setError,
        clearErrors,
    } as any);

    return (
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
            <div className="mt-4 grid gap-4 md:grid-cols-6">
                <div className="grid gap-2">
                    <Label htmlFor="cpfcnpj">CPF/CNPJ</Label>
                    <Input
                        type="text"
                        id="cpfcnpj"
                        value={maskCpfCnpj(data.cpfcnpj)}
                        onChange={(e) => setData('cpfcnpj', unMask(e.target.value) ?? '')}
                        maxLength={18}
                    />
                    {errors.cpfcnpj && <div className="text-sm text-red-500">{errors.cpfcnpj}</div>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="birth">Nascimento</Label>
                    <DatePicker
                        mode="single"
                        date={data.birth}
                        setDate={(value) => {
                            if (!value) {
                                setData('birth', '');
                                return;
                            }
                            const d = value as Date;
                            const formatted = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join(
                                '-',
                            );

                            setData('birth', formatted);
                        }}
                    />
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input type="email" id="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-6">
                <div className="grid gap-2">
                    <Label htmlFor="zipcode">CEP</Label>
                    <div className="relative flex gap-2">
                        <div className="relative w-full">
                            <Input
                                type="text"
                                id="zipcode"
                                value={maskCep(data.zipcode)}
                                onChange={(e) => setData('zipcode', unMask(e.target.value) ?? '')}
                                maxLength={9}
                                disabled={isZipcodeLoading}
                            />
                            {isZipcodeLoading && (
                                <Loader2Icon className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
                            )}
                        </div>
                        <Button type="button" size="icon" variant="outline" onClick={() => setZipcodeToSearch(data.zipcode)}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="state">UF</Label>
                    <Input type="text" id="state" value={data.state} onChange={(e) => setData('state', e.target.value)} />
                    {errors.state && <div>{errors.state}</div>}
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input type="text" id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="district">Bairro</Label>
                    <Input type="text" id="district" value={data.district} onChange={(e) => setData('district', e.target.value)} />
                </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="street">Endereço</Label>
                    <Input type="text" id="street" value={data.street} onChange={(e) => setData('street', e.target.value)} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input type="text" id="complement" value={data.complement} onChange={(e) => setData('complement', e.target.value)} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="number">Número</Label>
                    <Input type="text" id="number" value={data.number ?? ''} onChange={(e) => setData('number', e.target.value)} />
                </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-5">
                <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                        type="text"
                        id="phone"
                        value={maskPhone(data.phone)}
                        onChange={(e) => setData('phone', unMask(e.target.value) ?? '')}
                        maxLength={15}
                    />
                    {errors.phone && <div className="text-sm text-red-500">{errors.phone}</div>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="whatsapp">Whatsapp</Label>
                    <Input
                        type="text"
                        id="whatsapp"
                        value={maskPhone(data.whatsapp)}
                        onChange={(e) => setData('whatsapp', unMask(e.target.value) ?? '')}
                        maxLength={15}
                    />
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="contactname">Contato</Label>
                    <Input type="text" id="contactname" value={data.contactname} onChange={(e) => setData('contactname', e.target.value)} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="contactphone">Telefone do contato</Label>
                    <Input
                        type="text"
                        id="contactphone"
                        value={maskPhone(data.contactphone)}
                        onChange={(e) => setData('contactphone', unMask(e.target.value) ?? '')}
                        maxLength={15}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea id="observations" value={data.observations} onChange={(e) => setData('observations', e.target.value)} />
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    <Save />
                    Salvar
                </Button>
            </div>
        </form>
    );
}
