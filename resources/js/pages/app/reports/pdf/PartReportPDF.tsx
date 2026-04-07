import { typesPartsByValue } from '@/Utils/functions';
import { maskMoney } from '@/Utils/mask';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';

moment.locale('pt-br');

const styles = StyleSheet.create({
    page: {
        padding: 10,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#FAFAFA',
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 4,
        textTransform: 'uppercase',
        color: '#333',
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 14,
        color: '#555',
    },
    headerInfo: {
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 12,
        color: '#666',
    },
    tableContainer: {
        border: '1px solid #eeeded',
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#FFF',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#eeeded',
        borderBottom: '1px solid #999',
        paddingVertical: 5,
        paddingHorizontal: 6,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5px solid #DDD',
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    colSmall: { width: '8%', paddingVertical: 2, textAlign: 'center' },
    colMedium: { width: '18%', paddingVertical: 2, textAlign: 'left' },
    colLarge: { width: '22%', paddingVertical: 2, textAlign: 'left' },
    col: { flex: 1, textAlign: 'left', paddingVertical: 2 },
    colRight: { width: '8%', paddingVertical: 2, textAlign: 'right' },
    footer: {
        marginTop: 14,
        borderTop: '1px solid #AAA',
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

export default function PartReportPDF({ data, dateRange, company }: any) {
    const period =
        dateRange?.from && dateRange?.to
            ? `${moment(dateRange.from).format('DD/MM/YYYY')} - ${moment(dateRange.to).format('DD/MM/YYYY')}`
            : 'Período não informado';
    const totalItems = data.length;
    const stockTotal = data.reduce((acc: number, part: any) => acc + Number(part.quantity || 0), 0);
    const lowStock = data.filter((part: any) => Number(part.quantity || 0) <= Number(part.minimum_stock_level || 0)).length;
    const stockCost = data.reduce((acc: number, part: any) => acc + Number(part.quantity || 0) * Number(part.cost_price || 0), 0);
    const stockSale = data.reduce((acc: number, part: any) => acc + Number(part.quantity || 0) * Number(part.sale_price || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.logoPlaceholder}>
                    <Image source={`${company?.logo ? `/storage/logos/${company?.logo}` : '/images/default.png'}`} />
                </View>
                <Text style={styles.title}>{company?.companyname}</Text>
                <Text style={styles.subtitle}>Relatório de movimento de produtos e peças</Text>
                <Text style={styles.headerInfo}>
                    Período: {period} {'\n'}
                    Emitido em: {moment().format('DD/MM/YYYY HH:mm')}
                </Text>

                {/* Tabela */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colSmall}>#</Text>
                        <Text style={styles.colSmall}>Tipo</Text>
                        <Text style={styles.colSmall}>Ref.</Text>
                        <Text style={styles.colLarge}>Nome</Text>
                        <Text style={styles.colMedium}>Fabricante</Text>
                        <Text style={styles.colSmall}>Quant.</Text>
                        <Text style={styles.colSmall}>Mín.</Text>
                        <Text style={styles.colSmall}>Compra</Text>
                        <Text style={styles.colSmall}>Venda</Text>
                        <Text style={styles.colRight}>Mov.</Text>
                    </View>

                    {data.map((customer: any) => (
                        <View key={customer.id} style={styles.tableRow}>
                            <Text style={styles.colSmall}>{customer.part_number}</Text>
                            <Text style={styles.colSmall}>{typesPartsByValue(customer.type)}</Text>
                            <Text style={styles.colSmall}>{customer.reference_number}</Text>
                            <Text style={styles.colLarge}>{customer.name}</Text>
                            <Text style={styles.colMedium}>{customer.manufacturer}</Text>
                            <Text style={styles.colSmall}>{customer.quantity}</Text>
                            <Text style={styles.colSmall}>{customer.minimum_stock_level}</Text>
                            <Text style={styles.colSmall}>R$ {maskMoney(String(customer.cost_price ?? 0))}</Text>
                            <Text style={styles.colSmall}>R$ {maskMoney(String(customer.sale_price ?? 0))}</Text>
                            <Text style={styles.colRight}>{moment(customer.created_at).format('DD/MM/YYYY')}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerCards}>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Itens</Text>
                            <Text style={styles.footerCardValue}>{totalItems}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Quantidade em estoque</Text>
                            <Text style={styles.footerCardValue}>{stockTotal}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Abaixo do mínimo</Text>
                            <Text style={styles.footerCardValue}>{lowStock}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Estoque a custo</Text>
                            <Text style={styles.footerCardValue}>R$ {maskMoney(String(stockCost))}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Estoque a venda</Text>
                            <Text style={styles.footerCardValue}>R$ {maskMoney(String(stockSale))}</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
