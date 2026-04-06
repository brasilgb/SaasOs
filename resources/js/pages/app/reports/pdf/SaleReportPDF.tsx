import { maskMoney } from '@/Utils/mask';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';

moment.locale('pt-br');

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 10 },
    title: { fontSize: 16, textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 11, textAlign: 'center', marginBottom: 15 },
    headerInfo: { fontSize: 10, marginBottom: 15, textAlign: 'center' },
    tableHeader: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        paddingBottom: 4,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5px solid #ccc',
        paddingVertical: 2,
    },
    colSmall: { width: '10%', textAlign: 'center' },
    colMedium: { width: '45%', textAlign: 'left' },
    colRight: { width: '20%', textAlign: 'right' },
    colDate: { width: '25%', textAlign: 'center' },
    footer: {
        marginTop: 10,
        borderTop: '1px solid #000',
        paddingTop: 5,
        fontSize: 10,
        textAlign: 'center',
    },
    logoPlaceholder: { paddingVertical: 4, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', minWidth: '100%' },
});

export default function SalesReportPDF({ data, dateRange, company }: any) {
    const period = dateRange?.from && dateRange?.to
        ? `${moment(dateRange.from).format('DD/MM/YYYY')} - ${moment(dateRange.to).format('DD/MM/YYYY')}`
        : 'Período não informado';

    const totalGeral = data.reduce((acc: number, sale: any) => acc + Number(sale.total_amount || 0), 0);
    const totalCanceled = data
        .filter((sale: any) => sale.status === 'cancelled')
        .reduce((acc: number, sale: any) => acc + Number(sale.total_amount || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.logoPlaceholder}>
                    <Image source={`${company?.logo ? `/storage/logos/${company?.logo}` : '/images/default.png'}`} />
                </View>
                <Text style={styles.title}>{company?.companyname}</Text>
                <Text style={styles.subtitle}>Relatório de Vendas</Text>
                <Text style={styles.headerInfo}>
                    Período: {period}
                    {'\n'}
                    Emitido em: {moment().format('DD/MM/YYYY HH:mm')}
                </Text>

                {/* Cabeçalho da tabela */}
                <View style={styles.tableHeader}>
                    <Text style={styles.colSmall}>#</Text>
                    <Text style={styles.colMedium}>Cliente</Text>
                    <Text style={styles.colDate}>Data Compra</Text>
                    <Text style={styles.colDate}>Status</Text>
                    <Text style={styles.colRight}>Valor Total (R$)</Text>
                </View>

                {/* Linhas de dados */}
                {data.map((sale: any) => (
                    <View key={sale.id} style={styles.tableRow}>
                        <Text style={styles.colSmall}>{sale.sales_number || sale.id}</Text>
                        <Text style={styles.colMedium}>{sale.customer?.name || 'N/A'}</Text>
                        <Text style={styles.colDate}>{moment(sale.created_at).format('DD/MM/YYYY')}</Text>
                        <Text style={styles.colDate}>{sale.status === 'cancelled' ? 'Cancelada' : 'Completa'}</Text>
                        <Text style={styles.colRight}>R$ {maskMoney(String(sale.total_amount))}</Text>
                    </View>
                ))}

                {/* Rodapé com totais */}
                <View style={[styles.footer, { flex: 1, flexDirection: 'row', justifyContent: 'space-between', textAlign: 'center' }]}>
                    <Text>Nº Vendas: {data.length}</Text>
                    <Text>Nº Canceladas: {data.filter((sale: any) => sale.status === 'cancelled').length}</Text>
                    <Text>Total: R$ {maskMoney(String(totalGeral))}</Text>
                    <Text>Canceladas: R$ {maskMoney(String(totalCanceled))}</Text>
                </View>
            </Page>
        </Document>
    );
}
