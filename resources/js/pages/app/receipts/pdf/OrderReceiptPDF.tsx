import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

type Props = {
    order: any;
    company: any;
    type: string;
    receipt: any;
    checklist: any;
};

const styles = StyleSheet.create({
    page: {
        padding: 24,
        fontSize: 10,
        color: '#111827',
    },
    header: {
        marginBottom: 10,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 9,
        color: '#4b5563',
    },
    section: {
        marginTop: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 700,
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    col: {
        width: '49%',
    },
    text: {
        marginBottom: 3,
        lineHeight: 1.35,
    },
    footer: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 8,
        fontSize: 9,
        color: '#4b5563',
    },
});

function titleByType(type: string) {
    if (type === 'oraberta') return 'Recibo de Entrada de Equipamento';
    if (type === 'orentrega') return 'Recibo de Entrega de Equipamento';
    if (type === 'ororcamento') return 'Recibo de Geração de Orçamento';
    if (type === 'orchecklist') return 'Checklist para Entrega do Equipamento';
    return 'Recibo';
}

function textByType(type: string, receipt: any) {
    if (type === 'oraberta') return receipt?.receivingequipment ?? '';
    if (type === 'orentrega') return receipt?.equipmentdelivery ?? '';
    if (type === 'ororcamento') return receipt?.budgetissuance ?? '';
    if (type === 'orchecklist') return 'Checklist do equipamento';
    return '';
}

function formatMoney(value: any) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
}

export default function OrderReceiptPDF({ order, company, type, receipt, checklist }: Props) {
    const checklistItems = checklist?.checklist ? String(checklist.checklist).split(',').map((item: string) => item.trim()).filter(Boolean) : [];
    const orderParts = order?.order_parts ?? order?.orderParts ?? [];

    return (
        <Document title={`${titleByType(type)} - OS ${order?.order_number ?? ''}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>{titleByType(type)}</Text>
                    <Text style={styles.subtitle}>
                        {company?.companyname ?? ''} | CNPJ: {company?.cnpj ?? '-'} | OS #{order?.order_number ?? '-'}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados do Cliente</Text>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.text}>Nome: {order?.customer?.name ?? '-'}</Text>
                            <Text style={styles.text}>CPF/CNPJ: {order?.customer?.cpfcnpj ?? '-'}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.text}>Telefone: {order?.customer?.phone ?? '-'}</Text>
                            <Text style={styles.text}>
                                Endereço: {order?.customer?.street ?? '-'}, {order?.customer?.number ?? '-'} - {order?.customer?.district ?? '-'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Equipamento</Text>
                    <Text style={styles.text}>Equipamento: {order?.equipment?.equipment ?? '-'}</Text>
                    <Text style={styles.text}>Modelo: {order?.model ?? '-'}</Text>
                    <Text style={styles.text}>Defeito: {order?.defect ?? '-'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Garantias e/ou Observações</Text>
                    <Text style={styles.text}>{textByType(type, receipt) || '-'}</Text>
                </View>

                {type === 'ororcamento' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Orçamento Gerado</Text>
                        <Text style={styles.text}>{order?.budget_description ?? '-'}</Text>
                        <Text style={styles.text}>Valor: {formatMoney(order?.budget_value)}</Text>
                    </View>
                )}

                {type === 'orentrega' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Serviço Prestado</Text>
                        <Text style={styles.text}>{order?.services_performed ?? '-'}</Text>
                        <Text style={styles.text}>
                            Peças: {orderParts.length > 0 ? orderParts.map((part: any) => part?.name).filter(Boolean).join(', ') : order?.parts ?? '-'}
                        </Text>
                        <Text style={styles.text}>Total: {formatMoney(order?.service_cost)}</Text>
                    </View>
                )}

                {type === 'orchecklist' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Checklist</Text>
                        <Text style={styles.text}>{checklistItems.length > 0 ? checklistItems.join(', ') : '-'}</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text>
                        {company?.city ?? '-'}, {new Date().toLocaleDateString('pt-BR')}
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
