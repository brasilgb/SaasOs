import { Button } from '@/components/ui/button';
import { pdf } from '@react-pdf/renderer'; // Importe a função 'pdf'
import { LoaderIcon, PrinterIcon } from 'lucide-react';
import { useState } from 'react';
import { BudgetPDF } from './BudgetPDF'; // Importe o componente que criamos

/**
 * Componente para gerar e abrir o PDF em uma nova aba.
 * @param {object} props
 * @param {object} props.company - Dados da empresa.
 * @param {object} props.budget - Dados do orçamento.
 */
export function PrintBudget({ company, budget }: any) {
    const [loading, setLoading] = useState(false);

    // 1. Função que lida com a geração e abertura do PDF
    const handleViewPDF = async () => {
        setLoading(true);

        try {
            const pdfInstance = pdf(<BudgetPDF company={company} budget={budget} />);

            const blob = await pdfInstance.toBlob();

            const url = URL.createObjectURL(blob);

            window.open(url, '_blank');
        } catch (error) {
            console.error('Erro ao gerar ou abrir o PDF:', error);
            alert('Houve um erro ao gerar o PDF. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="print-budget-container">
            <Button
                onClick={handleViewPDF}
                disabled={loading || !company || !budget} // Desabilita se estiver carregando ou sem dados
                title={!company || !budget ? 'Dados do orçamento ausentes' : 'Visualizar Orçamento'}
            >
                {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <PrinterIcon className="h-4 w-4" />}
                Gerar
            </Button>
        </div>
    );
}
