import { maskMoney } from '@/Utils/mask';
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
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 4,
    },

    subtitle: {
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 12,
        color: '#555',
    },

    headerInfo: {
        textAlign: 'center',
        marginBottom: 10,
    },

    table: {
        border: '1px solid #DDD',
        borderRadius: 3,
    },

    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#EEE',
        borderBottom: '1px solid #AAA',
        paddingVertical: 5,
    },

    row: {
        flexDirection: 'row',
        borderBottom: '0.5px solid #DDD',
        paddingVertical: 5,
    },

    colDate: {
        width: '18%',
        paddingLeft: 6,
    },

    colSmall: {
        width: '14%',
        textAlign: 'center',
    },

    colMoney: {
        width: '20%',
        textAlign: 'right',
        paddingRight: 6,
    },

    footer: {
        marginTop: 12,
        borderTop: '1px solid #AAA',
        paddingTop: 6,
    },

    total: {
        fontWeight: 'bold',
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

        if (order.service_status === 6 || order.service_status === 7) {
            statsByDay[date].concluidos += 1;
        }

        if (order.service_status === 8) {
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
                    Período: {moment(dateRange.from).format('DD/MM/YYYY')} até {moment(dateRange.to).format('DD/MM/YYYY')}
                    Emitido em: {moment().format('DD/MM/YYYY HH:mm')}
                </Text>

                <View style={styles.table}>
                    <View style={styles.headerRow}>
                        <Text style={styles.colDate}>Data</Text>
                        <Text style={styles.colSmall}>Entradas</Text>
                        <Text style={styles.colSmall}>Concluídos</Text>
                        <Text style={styles.colSmall}>Entregues</Text>
                        <Text style={styles.colMoney}>Serviços</Text>
                        <Text style={styles.colMoney}>Peças</Text>
                    </View>

                    {rows.map((row, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.colDate}>{moment(row.date).format('DD/MM/YYYY')}</Text>

                            <Text style={styles.colSmall}>{row.entradas}</Text>

                            <Text style={styles.colSmall}>{row.concluidos}</Text>

                            <Text style={styles.colSmall}>{row.entregues}</Text>

                            <Text style={styles.colMoney}>R$ {maskMoney(String(row.totalServicos))}</Text>

                            <Text style={styles.colMoney}>R$ {maskMoney(String(row.totalPecas))}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text>Total de entradas: {totalEntradas}</Text>
                    <Text>Total concluídos: {totalConcluidos}</Text>
                    <Text>Total entregues: {totalEntregues}</Text>

                    <Text style={styles.total}>Total serviços: R$ {maskMoney(String(totalServicos))}</Text>

                    <Text style={styles.total}>Total peças: R$ {maskMoney(String(totalPecas))}</Text>
                </View>
            </Page>
        </Document>
    );
}
