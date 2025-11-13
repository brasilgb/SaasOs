import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";
import "moment/dist/locale/pt-br";
import { maskCpfCnpj, maskMoney, maskPhone } from "@/Utils/mask";

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
  colMedium: { width: "15%", paddingVertical: 2, textAlign: "left" },
  colLarge: { width: "22%", paddingVertical: 2, textAlign: "left" },
  col: { flex: 1, textAlign: "left", paddingVertical: 2 },
  colRight: { width: "10%", paddingVertical: 2, textAlign: "right" },
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

const STATUS_MAP: Record<number, string> = {
  1: "Ordem Aberta",
  2: "Em atendimento",
  3: "Fechada"
}

export default function SchedulesReportPDF({ data, dateRange }: any) {

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <Text style={styles.title}>Minha Empresa</Text>
        <Text style={styles.subtitle}>Relatório de Clientes</Text>
        <Text style={styles.headerInfo}>
          Período: {moment(dateRange.from).format("DD/MM/YYYY")} -{" "}
          {moment(dateRange.to).format("DD/MM/YYYY")} {"\n"}
          Emitido em: {moment().format("DD/MM/YYYY HH:mm")}
        </Text>

        {/* Tabela 	Cliente	Horário da visita	Serviço	Status	Técnico	Solicitação*/}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSmall}>#</Text>
            <Text style={styles.colLarge}>Cliente</Text>
            <Text style={styles.colMedium}>Visita</Text>
            <Text style={styles.colMedium}>Serviço</Text>
            <Text style={styles.colMedium}>Status</Text>
            <Text style={styles.colMedium}>Técnico</Text>
            <Text style={styles.colRight}>Solicitação</Text>
          </View>

          {data.map((customer: any) => (
            <View key={customer.id} style={styles.tableRow}>
              <Text style={styles.colSmall}>{customer.schedules_number}</Text>
              <Text style={styles.colLarge}>{customer.customer.name}</Text>
              <Text style={styles.colMedium}>{moment(customer.schedules).format("DD/MM/YYYY HH:mm")}</Text>
              <Text style={styles.colMedium}>{customer.service}</Text>
              <Text style={styles.colMedium}>
                {STATUS_MAP[customer.status] || "—"}
              </Text>
              <Text style={styles.colMedium}>{customer.user.name}</Text>
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
