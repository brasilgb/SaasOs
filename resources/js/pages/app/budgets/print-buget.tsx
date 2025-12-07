import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer'; // Importe a função 'pdf'
import { BudgetPDF } from './BudgetPDF'; // Importe o componente que criamos
import { Button } from '@/components/ui/button';
import { LoaderIcon, PrinterIcon } from 'lucide-react';

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
    // ⚠️ Verificação: Se os dados essenciais não existirem, encerra.
    if (!company || !budget) {
        console.error("Dados de empresa ou orçamento ausentes.");
        return;
    }

    setLoading(true);

    try {
      // Cria a instância do PDF diretamente dentro da função assíncrona
      // usando o componente React (BudgetPDF).
      const pdfInstance = pdf(<BudgetPDF company={company} budget={budget} />);
      
      // Gera o Blob a partir da instância do PDF
      // A chamada para pdfInstance.toBlob() é assíncrona.
      const blob = await pdfInstance.toBlob();

      // Cria uma URL temporária do Blob
      const url = URL.createObjectURL(blob);

      // Abre a URL em uma nova aba
      window.open(url, '_blank');
      
      // 💡 Opcional: Recomendado liberar a URL para economia de memória.
      // Você pode fazer isso após um breve timeout, pois o navegador
      // precisa da URL para carregar o conteúdo na nova aba.
      // setTimeout(() => URL.revokeObjectURL(url), 100); 

    } catch (error) {
      console.error("Erro ao gerar ou abrir o PDF:", error);
      alert("Houve um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="print-budget-container">
      {/* Botão VIEW */}
      <Button 
        onClick={handleViewPDF} 
        disabled={loading || !company || !budget} // Desabilita se estiver carregando ou sem dados
        title={!company || !budget ? "Dados do orçamento ausentes" : "Visualizar Orçamento"}
      >
        {loading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <PrinterIcon className="w-4 h-4" />}
        Gerar
      </Button>
    </div>
  );
}