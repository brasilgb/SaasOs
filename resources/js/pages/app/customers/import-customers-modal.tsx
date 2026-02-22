import { ChangeEvent, FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    arquivo: File | null;
}

export default function ImportCustomersModal({ isOpen, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        arquivo: null,
    });

    if (!isOpen) return null;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('app.import.customer'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

const baixarExemplo = () => {
    // Começando direto pelos dados que o usuário realmente tem
    const headers = "name;cpfcnpj;birth;email;zipcode;state;city;district;street;complement;number;phone;contactname;whatsapp;contactphone;observations";
    
    // Removi os espaços vazios do início da linha de exemplo
    const exemplo = "\nJoao da Silva;12345678900;1990-05-15;joao@email.com;01001-000;SP;Sao Paulo;Se;Praca da Se;Edificio;100;(11) 99999-8888;Maria Silva;5511988887777;(11) 99999-8888;Cliente para teste de importacao";

    const csvContent = headers + exemplo;

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "customer_model.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-secondary">Importar CSV de Clientes</h3>
                    <Button variant={'link'} onClick={onClose}>
                        <X className='h-4 w-4' />
                    </Button>
                </div>

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecione o arquivo .csv
                        </label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                if (e.target.files) setData('arquivo', e.target.files[0]);
                            }}
                            className="block w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                        />
                        {errors.arquivo && (
                            <p className="text-red-500 text-xs mt-1">{errors.arquivo}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant={'destructive'}
                            type="button"
                            onClick={baixarExemplo}
                        >
                            Baixar modelo .csv
                        </Button>
                        <Button
                            variant={'secondary'}
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant={'default'}
                            type="submit"
                            disabled={processing || !data.arquivo}
                            className="px-4 py-2 text-sm"
                        >
                            {processing ? 'Importando...' : 'Confirmar Importação'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}