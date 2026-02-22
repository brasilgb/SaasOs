import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";
import { maskCpfCnpj, maskPhone } from "@/Utils/mask";

moment.locale("pt-br");

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 4,
    textTransform: "uppercase",
    color: "#333",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 14,
    color: "#555",
  },
  headerInfo: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 12,
    color: "#666",
  },
  tableContainer: {
    border: "1px solid #eeeded",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eeeded",
    borderBottom: "1px solid #999",
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5px solid #DDD",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  colSmall: { width: "8%", paddingVertical: 2, textAlign: "center" },
  colMedium: { width: "18%", paddingVertical: 2, textAlign: "left" },
  colLarge: { width: "22%", paddingVertical: 2, textAlign: "left" },
  col: { flex: 1, textAlign: "left", paddingVertical: 2 },
  colRight: { width: "8%", paddingVertical: 2, textAlign: "right" },
  footer: {
    marginTop: 14,
    borderTop: "1px solid #AAA",
    paddingTop: 6,
    fontSize: 10,
    textAlign: "center",
    color: "#333",
  },
  totalHighlight: {
    fontWeight: "bold",
    marginTop: 2,
    color: "#000",
  },
});

export default function CustomerReportPDF({ data, dateRange, company }: any) {

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <Text style={styles.title}>{company}</Text>
        <Text style={styles.subtitle}>Relatório de Clientes</Text>
        <Text style={styles.headerInfo}>
          Período: {moment(dateRange.from).format("DD/MM/YYYY")} -{" "}
          {moment(dateRange.to).format("DD/MM/YYYY")} {"\n"}
          Emitido em: {moment().format("DD/MM/YYYY HH:mm")}
        </Text>

        {/* Tabela */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSmall}>#</Text>
            <Text style={styles.colLarge}>Cliente</Text>
            <Text style={styles.colMedium}>E-mail</Text>
            <Text style={styles.colMedium}>CPF/CNPJ</Text>
            <Text style={styles.colMedium}>Telefone</Text>
            <Text style={styles.colRight}>Cadastro</Text>
          </View>

          {data.map((customer: any) => (
            <View key={customer.id} style={styles.tableRow}>
              <Text style={styles.colSmall}>{customer.customer_number}</Text>
              <Text style={styles.colLarge}>{customer.name}</Text>
              <Text style={styles.colMedium}>{customer.email}</Text>
              <Text style={styles.colMedium}>{maskCpfCnpj(customer.cpfcnpj)}</Text>
              <Text style={styles.colMedium}>{maskPhone(customer.phone)}</Text>
              <Text style={styles.colRight}>
                {moment(customer.created_at).format("DD/MM/YYYY")}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
