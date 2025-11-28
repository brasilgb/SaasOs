import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// --- Utilitários ---
const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'R$ 0,00'; 
    return `R$ ${num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
};

// --- Estilos ---
const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontFamily: 'Helvetica', 
    fontSize: 10, 
    lineHeight: 1.5 
  },
  
  // === Cabeçalho da Empresa ===
  headerSection: { 
    marginBottom: 20, 
    paddingBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333', 
    borderBottomStyle: 'solid', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  companyInfo: { width: '75%' },
  companyName: { fontSize: 18, fontWeight: 'bold', marginBottom: 2, color: '#003366' },
  companyDetails: { fontSize: 9, color: '#555' },
  logoPlaceholder: { width: '20%', height: 50, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', border: '1px solid #ccc' },
  
  // === Título ===
  budgetTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center', 
    textDecoration: 'underline', 
    color: '#333' 
  },
  
  // === Seção de Detalhes (Geral) ===
  sectionContainer: {
    marginBottom: 15,
    padding: 5,
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    paddingBottom: 2,
    borderBottom: '1px solid #eee',
  },

  // Layout de Colunas (Usado para Valores)
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  column: {
    width: '48%', // Duas colunas
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    color: '#000',
  },

  // === Observações ===
  obsBox: { 
    marginTop: 10,
    border: '1px solid #ccc', 
    padding: 8, 
    minHeight: 60,
  },
  totalGeral: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A50000',
    marginTop: 10,
    paddingTop: 5,
    borderTop: '1px solid #333',
    textAlign: 'right',
  }
});

/**
 * Componente do Orçamento em PDF.
 */
export const BudgetPDF = ({ company, budget }) => {
  // 1. Desestruturando Dados da EMPRESA
  const { companyname, cnpj, city, number, street, district, telephone } = company;
  
  // 2. Desestruturando Dados do ORÇAMENTO (Serviço e Observação)
  const { 
    service, 
    description, 
    estimated_time, 
    part_value, 
    labor_value, 
    total_value, 
    warranty, 
    obs, 
  } = budget;
  
  const obsText = obs || 'Nenhuma observação informada.';
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* === Cabeçalho da Empresa === */}
        <View style={styles.headerSection} fixed>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyname}</Text>
            <Text style={styles.companyDetails}>CNPJ: {cnpj}</Text>
            <Text style={styles.companyDetails}>Tel: {telephone}</Text>
            <Text style={styles.companyDetails}>
              {street}, {number} - {district}, {city}
            </Text>
          </View>
          <View style={styles.logoPlaceholder}>
            <Text style={{ fontSize: 8 }}>LOGO AQUI</Text>
          </View>
        </View>

        {/* --- Título do Orçamento --- */}
        <Text style={styles.budgetTitle}>DETALHES DO ORÇAMENTO DE SERVIÇO</Text>

        {/* === 1. Detalhes do Serviço === */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Serviço Orçado</Text>
            
            <View style={styles.detailItem}>
                <Text style={styles.label}>Nome do Serviço:</Text>
                <Text style={styles.value}>{service}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Descrição:</Text>
                <Text style={styles.value}>{description}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Tempo Estimado:</Text>
                <Text style={styles.value}>{estimated_time}</Text>
            </View>
        </View>

        {/* === 2. Valores e Garantia === */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Valores e Condições</Text>
            
            <View style={styles.row}>
                <View style={styles.column}>
                    <View style={styles.detailItem}>
                        <Text style={styles.label}>Valor Mão de Obra:</Text>
                        <Text style={styles.value}>{formatCurrency(labor_value)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.label}>Valor Peças:</Text>
                        <Text style={styles.value}>{formatCurrency(part_value)}</Text>
                    </View>
                </View>
                
                <View style={styles.column}>
                    <View style={styles.detailItem}>
                        <Text style={styles.label}>Garantia:</Text>
                        <Text style={styles.value}>{warranty}</Text>
                    </View>
                    
                    {/* Linha Total */}
                    <View style={[styles.detailItem, styles.totalGeral]}>
                        <Text>TOTAL GERAL:</Text>
                        <Text>{formatCurrency(total_value)}</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* === 3. Observações === */}
        <View style={styles.obsBox}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Observações:</Text>
            <Text>{obsText}</Text>
        </View>

      </Page>
    </Document>
  );
};