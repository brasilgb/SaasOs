import { currencyFormatter } from '@/Utils/currency-formatter';
import { ORDER_STATUS, ORDER_STATUSES_COMPLETED } from '@/Utils/order-status';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';

moment.locale('pt-br');

const styles = StyleSheet.create({
    page: {
        padding: 14,
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

    colDate: {
        width: '18%',
        textAlign: 'left',
        paddingVertical: 2,
    },

    colSmall: {
        width: '14%',
        paddingVertical: 2,
        textAlign: 'center',
    },

    colMoney: {
        width: '20%',
        paddingVertical: 2,
        textAlign: 'right',
    },

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

type OrderDailyRow = {
    date: string;
    entradas: number;
    concluidos: number;
    entregues: number;
    totalServicos: number;
    totalPecas: number;
};

type OrderDailyOrder = {
    created_at: string;
    service_status: number;
    service_value?: number | string | null;
    parts_value?: number | string | null;
};

type DateRange = {
    from: string;
    to: string;
};

type Company = {
    logo?: string | null;
    companyname?: string | null;
};

export default function OrderDailyReportPDF({
    data,
    dateRange,
    company,
}: {
    data: OrderDailyOrder[];
    dateRange: DateRange;
    company?: Company | null;
}) {
    const period =
        dateRange?.from && dateRange?.to
            ? `${moment(dateRange.from).format('DD/MM/YYYY')} - ${moment(dateRange.to).format('DD/MM/YYYY')}`
            : 'Período não informado';

    const statsByDay: Record<string, OrderDailyRow> = {};

    data.forEach((order) => {
        const date = moment(order.created_at).format('YYYY-MM-DD');

        if (!statsByDay[date]) {
            statsByDay[date] = {
                date,
                entradas: 0,
                concluidos: 0,
                entregues: 0,
                totalServicos: 0,
                totalPecas: 0,
            };
        }

        statsByDay[date].entradas += 1;

        if (ORDER_STATUSES_COMPLETED.includes(order.service_status)) {
            statsByDay[date].concluidos += 1;
        }

        if (order.service_status === ORDER_STATUS.DELIVERED) {
            statsByDay[date].entregues += 1;
        }

        statsByDay[date].totalServicos += Number(order.service_value || 0);
        statsByDay[date].totalPecas += Number(order.parts_value || 0);
    });

    const rows = Object.values(statsByDay).sort((a, b) => b.date.localeCompare(a.date));

    const totalEntradas = rows.reduce((acc, r) => acc + r.entradas, 0);
    const totalConcluidos = rows.reduce((acc, r) => acc + r.concluidos, 0);
    const totalEntregues = rows.reduce((acc, r) => acc + r.entregues, 0);
    const totalServicos = rows.reduce((acc, r) => acc + r.totalServicos, 0);
    const totalPecas = rows.reduce((acc, r) => acc + r.totalPecas, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.logoPlaceholder}>
                    <Image source={`${company?.logo ? `/storage/logos/${company?.logo}` : '/images/default.png'}`} />
                </View>
                <Text style={styles.title}>{company?.companyname}</Text>
                <Text style={styles.subtitle}>Relatório Movimento Diário de Ordens</Text>

                <Text style={styles.headerInfo}>
                    Período: {period} {'\n'}
                    Emitido em: {moment().format('DD/MM/YYYY HH:mm')}
                </Text>

                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDate}>Data</Text>
                        <Text style={styles.colSmall}>Entradas</Text>
                        <Text style={styles.colSmall}>Concluídos</Text>
                        <Text style={styles.colSmall}>Entregues</Text>
                        <Text style={styles.colMoney}>Serviços</Text>
                        <Text style={styles.colMoney}>Peças</Text>
                    </View>

                    {rows.map((row, index) => (
                        <View key={`${row.date}-${index}`} style={styles.tableRow}>
                            <Text style={styles.colDate}>{moment(row.date).format('DD/MM/YYYY')}</Text>
                            <Text style={styles.colSmall}>{row.entradas}</Text>
                            <Text style={styles.colSmall}>{row.concluidos}</Text>
                            <Text style={styles.colSmall}>{row.entregues}</Text>
                            <Text style={styles.colMoney}>{currencyFormatter(row.totalServicos)}</Text>
                            <Text style={styles.colMoney}>{currencyFormatter(row.totalPecas)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerCards}>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Entradas</Text>
                            <Text style={styles.footerCardValue}>{totalEntradas}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Concluídos</Text>
                            <Text style={styles.footerCardValue}>{totalConcluidos}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Entregues</Text>
                            <Text style={styles.footerCardValue}>{totalEntregues}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Total Serviços</Text>
                            <Text style={styles.footerCardValue}>{currencyFormatter(totalServicos)}</Text>
                        </View>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerCardLabel}>Total Peças</Text>
                            <Text style={styles.footerCardValue}>{currencyFormatter(totalPecas)}</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
