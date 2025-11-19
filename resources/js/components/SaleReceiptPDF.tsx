import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";
import { maskMoney } from "@/Utils/mask";

interface CartItem {
    name: string;
    selected_quantity: number;
    sale_price: number;
}

interface SaleReceiptPDFProps {
    items: CartItem[];
    total: number;
    customerName?: string;
}

// Define os estilos para o PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 30,
        fontFamily: "Helvetica",
    },
    header: {
        textAlign: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    subtitle: {
        fontSize: 12,
        color: "grey",
        marginTop: 4,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
        paddingBottom: 4,
    },
    customerInfo: {
        fontSize: 12,
        marginBottom: 5,
    },
    table: {
        display: "flex",
        width: "auto",
        borderStyle: "solid",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
        alignItems: "center",
        minHeight: 24,
    },
    tableColHeader: {
        fontWeight: "bold",
        fontSize: 10,
    },
    tableCol: {
        fontSize: 10,
    },
    col1: { width: "50%" },
    col2: { width: "15%", textAlign: "center" },
    col3: { width: "15%", textAlign: "right" },
    col4: { width: "20%", textAlign: "right" },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: "center",
        fontSize: 10,
        color: "grey",
    },
    totalSection: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    totalText: {
        fontSize: 14,
        fontWeight: "bold",
    },
});


const SaleReceiptPDF = ({ items, total, customerName }: SaleReceiptPDFProps) => (
    <Document title={`Recibo de Venda - ${moment().format("DD/MM/YYYY")}`}>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Recibo de Venda</Text>
                <Text style={styles.subtitle}>{moment().format("DD/MM/YYYY HH:mm")}</Text>
            </View>

            {customerName && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cliente</Text>
                    <Text style={styles.customerInfo}>{customerName}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Itens</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableColHeader, styles.col1]}>Produto</Text>
                        <Text style={[styles.tableColHeader, styles.col2]}>Qtd.</Text>
                        <Text style={[styles.tableColHeader, styles.col3]}>Vlr. Unit.</Text>
                        <Text style={[styles.tableColHeader, styles.col4]}>Subtotal</Text>
                    </View>
                    {items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.tableCol, styles.col1]}>{item.name}</Text>
                            <Text style={[styles.tableCol, styles.col2]}>{item.selected_quantity}</Text>
                            <Text style={[styles.tableCol, styles.col3]}>R$ {maskMoney(String(item.sale_price || 0))}</Text>
                            <Text style={[styles.tableCol, styles.col4]}>R$ {maskMoney(String((item.sale_price || 0) * (item.selected_quantity || 0)))}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.totalSection}>
                <Text style={styles.totalText}>Total: R$ {maskMoney(String(total || 0))}</Text>
            </View>

            <View style={styles.footer}>
                <Text>Obrigado pela sua compra!</Text>
            </View>
        </Page>
    </Document>
);

export default SaleReceiptPDF;