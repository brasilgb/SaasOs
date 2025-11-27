import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Opcional: Registrar uma fonte para melhor suporte a caracteres especiais
// Font.register({ family: 'Roboto', src: 'caminho/para/sua/fonte.ttf' }); 
// Exemplo com fontes padrão:

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica', // Usando uma fonte padrão
    fontSize: 10,
    lineHeight: 1.5,
  },
  // --- Seção Cabeçalho ---
  headerSection: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    color: '#555',
  },
  // --- Seção Orçamento ---
  budgetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    textDecoration: 'underline',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f0f0f0',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 5,
    textAlign: 'right',
  },
  colService: {
    width: '40%',
    textAlign: 'left',
  },
  colServiceHeader: {
    width: '40%',
    textAlign: 'left',
  },
  // --- Seção Observação ---
  obsSection: {
    marginTop: 20,
    border: '1px solid #ccc',
    padding: 10,
  },
  obsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#888',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 5,
  }
});

const formatCurrency = (value) => `R$ ${parseFloat(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/**
 * Componente do Orçamento em PDF.
 * @param {object} props
 * @param {object} props.company - Dados da empresa.
 * @param {object} props.budget - Dados do orçamento (itens, observação).
 */
export const BudgetPDF = ({ company, budget }) => {
    
  const { companyname, telephone, cnpj, city } = company;
  const { service, labor_value, part_value, total_value, obs } = budget;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* === Cabeçalho da Empresa === */}
        <View style={styles.headerSection}>
          <Text style={styles.companyName}>{companyname}</Text>
          <Text style={styles.companyDetails}>CNPJ: {cnpj} | Tel: {telephone}</Text>
          <Text style={styles.companyDetails}>Endereço: {city}</Text>
        </View>

        {/* === Título do Orçamento === */}
        <Text style={styles.budgetTitle}>ORÇAMENTO</Text>

        {/* === Tabela de Serviços === */}
        <View style={styles.table}>
          {/* Cabeçalho da Tabela */}
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableColHeader, ...styles.colServiceHeader }}>Serviço e Descrição</Text>
            <Text style={styles.tableColHeader}>Mão de Obra</Text>
            <Text style={styles.tableColHeader}>Peças</Text>
            <Text style={styles.tableColHeader}>Total</Text>
          </View>

          {/* Linhas de Serviços */}

            <View style={styles.tableRow} key={index}>
              <View style={{ ...styles.tableCol, ...styles.colService }}>
                <Text style={{ fontWeight: 'bold' }}>{service}</Text>
              </View>
            </View>
          
          {/* Linha de Totais */}
          <View style={styles.tableRow} fixed> {/* 'fixed' garante que o total não seja quebrado entre páginas */}
            <Text style={{ ...styles.tableColHeader, ...styles.colServiceHeader, backgroundColor: '#e0e0e0' }}>TOTAL GERAL</Text>
            <Text style={{ ...styles.tableColHeader, backgroundColor: '#e0e0e0' }}>{formatCurrency(labor_value)}</Text>
            <Text style={{ ...styles.tableColHeader, backgroundColor: '#e0e0e0' }}>{formatCurrency(part_value)}</Text>
            <Text style={{ ...styles.tableColHeader, backgroundColor: '#e0e0e0' }}>{formatCurrency(total_value)}</Text>
          </View>

        </View>

        {/* === Observações === */}
        <View style={styles.obsSection}>
          <Text style={styles.obsTitle}>Observações:</Text>
          <Text>{obs}</Text>
        </View>
        
        {/* === Rodapé === */}
        <Text style={styles.footer} fixed>
          Orçamento válido por 7 dias. Para mais informações, entre em contato.
        </Text>

      </Page>
    </Document>
  );
};