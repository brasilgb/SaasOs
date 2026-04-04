import { maskMoney } from '@/Utils/mask';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';

const styles = StyleSheet.create({
    page: {
        padding: 14,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },

    title: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 6,
    },

    subtitle: {
        textAlign: 'center',
        marginBottom: 12,
    },

    table: {
        border: '1px solid #DDD',
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

    colName: {
        width: '40%',
        paddingLeft: 6,
    },

    colCenter: {
        width: '20%',
        textAlign: 'center',
    },

    colMoney: {
        width: '20%',
        textAlign: 'right',
        paddingRight: 6,
    },

    footer: {
        marginTop: 10,
        borderTop: '1px solid #AAA',
        paddingTop: 6,
    },
    metricsBox: {
        marginTop: 12,
        border: '1px solid #DDD',
        padding: 6,
    },

    metricTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    logoPlaceholder: { paddingVertical: 4, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', minWidth: '100%' },
});

export default function TechnicianProductivityPDF({ data, company }: any) {
    const statsByTechnician: any = {};

    data.forEach((order: any) => {
        if (order.service_status !== 6 && order.service_status !== 7) return;

        const tech = order.technician?.name || 'Não definido';

        if (!statsByTechnician[tech]) {
            statsByTechnician[tech] = {
                technician: tech,
                totalOrdens: 0,
                totalServicos: 0,
            };
        }

        statsByTechnician[tech].totalOrdens += 1;
        statsByTechnician[tech].totalServicos += Number(order.service_value || 0);
    });

    const rows = Object.values(statsByTechnician).map((r: any) => ({
        ...r,
        ticketMedio: r.totalServicos / r.totalOrdens,
    }));

    const completedOrders = data.filter((o: any) => o.service_status === 6 || o.service_status === 7);

    const deliveredOrders = data.filter((o: any) => o.service_status === 8);

    const avgRepairDays =
        completedOrders.reduce((acc: number, order: any) => {
            const start = moment(order.created_at);
            const end = moment(order.updated_at);
            return acc + end.diff(start, 'days');
        }, 0) / (completedOrders.length || 1);

    const avgDeliveryDays =
        deliveredOrders.reduce((acc: number, order: any) => {
            const start = moment(order.created_at);
            const end = moment(order.updated_at);
            return acc + end.diff(start, 'days');
        }, 0) / (deliveredOrders.length || 1);

    const pendingLongTime = data.filter((order: any) => {
        if (order.service_status >= 6) return false;

        const days = moment().diff(moment(order.created_at), 'days');

        return days > 7;
    }).length;

    const totalOrdens = rows.reduce((acc: any, r: any) => acc + r.totalOrdens, 0);
    const totalServicos = rows.reduce((acc: any, r: any) => acc + r.totalServicos, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.logoPlaceholder}>
                    <Image source={`${company?.logo ? `/storage/logos/${company?.logo}` : '/images/default.png'}`} />
                </View>
                <Text style={styles.title}>{company?.companyname}</Text>
                <Text style={styles.subtitle}>Relatório de Produtividade por Técnico</Text>

                <View style={styles.table}>
                    <View style={styles.headerRow}>
                        <Text style={styles.colName}>Técnico</Text>
                        <Text style={styles.colCenter}>Ordens</Text>
                        <Text style={styles.colMoney}>Serviços</Text>
                        <Text style={styles.colMoney}>Ticket Médio</Text>
                    </View>

                    {rows.map((row: any, index: number) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.colName}>{row.technician}</Text>

                            <Text style={styles.colCenter}>{row.totalOrdens}</Text>

                            <Text style={styles.colMoney}>R$ {maskMoney(String(row.totalServicos))}</Text>

                            <Text style={styles.colMoney}>R$ {maskMoney(String(row.ticketMedio))}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text>Total de ordens concluídas: {totalOrdens}</Text>
                    <Text>Total faturado em serviços: R$ {maskMoney(String(totalServicos))}</Text>
                </View>

                <View style={styles.metricsBox}>
                    <Text style={styles.metricTitle}>Indicadores de Tempo de Reparo</Text>

                    <Text>Tempo médio para concluir serviço: {avgRepairDays.toFixed(1)} dias</Text>

                    <Text>Tempo médio até entrega: {avgDeliveryDays.toFixed(1)} dias</Text>

                    <Text>Equipamentos pendentes há mais de 7 dias: {pendingLongTime}</Text>
                </View>
            </Page>
        </Document>
    );
}
