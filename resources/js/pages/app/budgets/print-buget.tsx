import React, { useState, useEffect, useMemo } from 'react';
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
export function PrintBudget({ company, budget }:any) {
  const [loading, setLoading] = useState(false);
  console.log(budget, company);
  // 1. Usamos useMemo para criar a representação do PDF (o Blob)
  // Isso evita que o PDF seja regenerado em cada renderização, a menos que os dados mudem.
  const pdfBlob = useMemo(() => {
      
      // Retorna null ou um objeto para a primeira renderização
      if (!company || !budget) return null;
      
      // O método 'pdf' recebe o componente <Document> e retorna uma API de Blob
      return pdf(<BudgetPDF company={company} budget={budget} />);
    }, [company, budget]);
    
    // 2. Função que lida com a geração e abertura do PDF
    const handleViewPDF = async () => {
        if (!pdfBlob) return;
        
        console.log(pdfBlob);
    setLoading(true);
    
    try {
      // Gera o Blob a partir da instância do PDF
      const blob = await pdfBlob.toBlob(); 
      
      // Cria uma URL temporária do Blob
      const url = URL.createObjectURL(blob);
      
      // Abre a URL em uma nova aba
      window.open(url, '_blank');
      
      // Opcional: Libere a URL do objeto quando o componente for desmontado, 
      // mas não é estritamente necessário para um link de visualização única.
      // URL.revokeObjectURL(url); 
      
    } catch (error) {
      console.error("Erro ao gerar ou abrir o PDF:", error);
      alert("Houve um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Verificação de dados
//   if (!company || !budget) {
//     return <p>Carregando dados do orçamento...</p>;
//   }

  return (
    <div className="print-budget-container">
      
      {/* Botão VIEW */}
      <Button 
        onClick={handleViewPDF} 
        disabled={loading}
      >
        {loading ? <LoaderIcon /> : <PrinterIcon />}
      </Button>
    </div>
  );
}