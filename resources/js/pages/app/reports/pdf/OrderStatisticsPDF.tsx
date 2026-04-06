import { maskMoney } from '@/Utils/mask';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';

moment.locale('pt-br');

const styles = StyleSheet.create({
    page: {
        padding: 12,
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
        marginBottom: 14,
        color: '#666',
    },

    section: {
        marginBottom: 14,
        border: '1px solid #ddd',
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#FFF',
    },

    sectionHeader: {
        backgroundColor: '#eeeded',
        padding: 6,
        fontWeight: 'bold',
        borderBottom: '1px solid #999',
    },

    row: {
        flexDirection: 'row',
        borderBottom: '0.5px solid #DDD',
        paddingVertical: 5,
        paddingHorizontal: 6,
    },

    col: {
        flex: 1,
    },

    colRight: {
        width: '25%',
        textAlign: 'right',
    },

    footer: {
        marginTop: 16,
        borderTop: '1px solid #AAA',
        paddingTop: 6,
        textAlign: 'center',
        fontSize: 10,
    },

    total: {
        fontWeight: 'bold',
        marginTop: 4,
    },
    logoPlaceholder: { paddingVertical: 4, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', minWidth: '100%' },
});

export default function OrderStatisticsPDF({ data, dateRange, company }: any) {
    const period = dateRange?.from && dateRange?.to
        ? `${moment(dateRange.from).format('DD/MM/YYYY')} - ${moment(dateRange.to).format('DD/MM/YYYY')}`
        : 'Período não informado';

    const stats = {
        total: data.length,
        abertas: data.filter((o: any) => o.service_status === 1).length,
        orcGerados: data.filter((o: any) => o.service_status === 3).length,
        orcAprovados: data.filter((o: any) => o.service_status === 4).length,
        reparo: data.filter((o: any) => o.service_status === 5).length,
        concluidos: data.filter((o: any) => o.service_status === 6 || o.service_status === 7).length,
        entregues: data.filter((o: any) => o.service_status === 8).length,
    };

    const totalServicos = data.reduce((acc: number, o: any) => acc + Number(o.service_value || 0), 0);

    const totalPecas = data.reduce((acc: number, o: any) => acc + Number(o.parts_value || 0), 0);

    const totalGeral = totalServicos + totalPecas;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.logoPlaceholder}>
                    <Image source={`${company?.logo ? `/storage/logos/${company?.logo}` : '/images/default.png'}`} />
                </View>
                <Text style={styles.title}>{company?.companyname}</Text>
                <Text style={styles.subtitle}>Resumo Geral de Ordens de Serviço</Text>

                <Text style={styles.headerInfo}>
                    Período: {period} {'\n'}
                    Emitido em: {moment().format('DD/MM/YYYY HH:mm')}
                </Text>

                {/* RESUMO GERAL */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Resumo Geral</Text>

                    <View style={styles.row}>
                        <Text style={styles.col}>Total de ordens no período</Text>
                        <Text style={styles.colRight}>{stats.total}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.col}>Ordens abertas</Text>
                        <Text style={styles.colRight}>{stats.abertas}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.col}>Orçamentos gerados</Text>
                        <Text style={styles.colRight}>{stats.orcGerados}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.col}>Orçamentos aprovados</Text>
                        <Text style={styles.colRight}>{stats.orcAprovados}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.col}>Equipamentos em reparo</Text>
                        <Text style={styles.colRight}>{stats.reparo}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.col}>Serviços concluídos</Text>
                        <Text style={styles.colRight}>{stats.concluidos}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.col}>Equipamentos entregues</Text>
                        <Text style={styles.colRight}>{stats.entregues}</Text>
                    </View>
                </View>

                {/* FATURAMENTO */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Faturamento</Text>

                    <View style={styles.row}>
                        <Text style={styles.col}>Total em serviços</Text>
                        <Text style={styles.colRight}>R$ {maskMoney(String(totalServicos))}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.col}>Total em peças</Text>
                        <Text style={styles.colRight}>R$ {maskMoney(String(totalPecas))}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.col}>Faturamento total</Text>
                        <Text style={styles.colRight}>R$ {maskMoney(String(totalGeral))}</Text>
                    </View>
                </View>

                {/* Rodapé */}
                <View style={styles.footer}>
                    <Text>Sistema de Gestão de Ordens de Serviço</Text>
                    <Text style={styles.total}>Total de ordens analisadas: {stats.total}</Text>
                </View>
            </Page>
        </Document>
    );
}
