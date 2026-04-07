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
    colNumber: { width: '8%', textAlign: 'center' },
    colCustomer: { width: '24%', textAlign: 'left' },
    colDate: { width: '13%', textAlign: 'center' },
    colStatus: { width: '12%', textAlign: 'center' },
    colPayment: { width: '13%', textAlign: 'center' },
    colMoney: { width: '10%', textAlign: 'right' },
    colItems: { width: '10%', textAlign: 'center' },
    footer: {
        marginTop: 10,
        borderTop: '1px solid #000',
        paddingTop: 6,
    },
    footerCards: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    footerCard: {
        width: '32%',
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: '#f7f7f7',
    },
    footerCardLabel: {
        fontSize: 8,
        color: '#555',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    footerCardValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111',
    },
    logoPlaceholder: { paddingVertical: 4, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', minWidth: '100%' },
});

export default function SalesReportPDF({ data, dateRange, company }: any) {
    const period =
        dateRange?.from && dateRange?.to
            ? `${moment(dateRange.from).format('DD/MM/YYYY')} - ${moment(dateRange.to).format('DD/MM/YYYY')}`
            : 'Período não informado';

    const totalGeral = data.reduce((acc: number, sale: any) => acc + Number(sale.total_amount || 0), 0);
    const totalCanceled = data
        .filter((sale: any) => sale.status === 'cancelled')
        .reduce((acc: number, sale: any) => acc + Number(sale.total_amount || 0), 0);
    const totalPaid = data.reduce((acc: number, sale: any) => acc + Number(sale.paid_amount || 0), 0);
    const totalRemaining = data.reduce(
        (acc: number, sale: any) => acc + Math.max(0, Number(sale.total_amount || 0) - Number(sale.paid_amount || 0)),
        0,
    );
    const totalItems = data.reduce((acc: number, sale: any) => acc + Number(sale.items_count || 0), 0);
    const paymentMethodLabel = (method?: string) => {
        switch (method) {
            case 'pix':
                return 'Pix';
            case 'cartao':
                return 'Cartão';
            case 'dinheiro':
                return 'Dinheiro';
            case 'transferencia':
                return 'Transferência';
            case 'boleto':
                return 'Boleto';
            default:
                return '-';
        }
    };

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
                    <Text style={styles.colNumber}>#</Text>
                    <Text style={styles.colCustomer}>Cliente</Text>
                    <Text style={styles.colDate}>Data Compra</Text>
                    <Text style={styles.colStatus}>Status</Text>
                    <Text style={styles.colPayment}>Pagamento</Text>
                    <Text style={styles.colItems}>Itens</Text>
                    <Text style={styles.colMoney}>Total</Text>
                    <Text style={styles.colMoney}>Pago</Text>
                    <Text style={styles.colMoney}>Saldo</Text>
                </View>

                {/* Linhas de dados */}
                {data.map((sale: any) => {
                    const total = Number(sale.total_amount || 0);
                    const paid = Number(sale.paid_amount || 0);
                    const remaining = Math.max(0, total - paid);

                    return (
                        <View key={sale.id} style={styles.tableRow}>
                            <Text style={styles.colNumber}>{sale.sales_number || sale.id}</Text>
                            <Text style={styles.colCustomer}>{sale.customer?.name || 'Consumidor Final'}</Text>
                            <Text style={styles.colDate}>{moment(sale.created_at).format('DD/MM/YYYY')}</Text>
                            <Text style={styles.colStatus}>{sale.status === 'cancelled' ? 'Cancelada' : 'Completa'}</Text>
                            <Text style={styles.colPayment}>{paymentMethodLabel(sale.payment_method)}</Text>
                            <Text style={styles.colItems}>{sale.items_count || 0}</Text>
                            <Text style={styles.colMoney}>{maskMoney(String(total))}</Text>
                            <Text style={styles.colMoney}>{maskMoney(String(paid))}</Text>
                            <Text style={styles.colMoney}>{maskMoney(String(remaining))}</Text>
                        </View>
                    );
                })}

                {/* Rodapé com totais */}
                <View style={styles.footer}>
                    <View style={styles.footerCards}>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Nº Vendas</Text>
                            <Text style={styles.footerCardValue}>{data.length}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Itens Vendidos</Text>
                            <Text style={styles.footerCardValue}>{totalItems}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Nº Canceladas</Text>
                            <Text style={styles.footerCardValue}>{data.filter((sale: any) => sale.status === 'cancelled').length}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Total</Text>
                            <Text style={styles.footerCardValue}>R$ {maskMoney(String(totalGeral))}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Pago</Text>
                            <Text style={styles.footerCardValue}>R$ {maskMoney(String(totalPaid))}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Saldo</Text>
                            <Text style={styles.footerCardValue}>R$ {maskMoney(String(totalRemaining))}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Canceladas</Text>
                            <Text style={styles.footerCardValue}>R$ {maskMoney(String(totalCanceled))}</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
