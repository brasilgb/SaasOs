import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";
import "moment/dist/locale/pt-br";
import { maskMoney } from "@/Utils/mask";

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
  colLarge: { width: "25%", paddingVertical: 2, textAlign: "left" },
  col: { flex: 1, textAlign: "left", paddingVertical: 2 },
  colRight: { width: "15%", paddingVertical: 2, textAlign: "right" },
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
  2: "Ordem Fechada",
  3: "Orçamento Gerado",
  4: "Orçamento Aprovado",
  5: "Executando Reparo",
  6: "(CA) Serviço Concluído",
  7: "(CN) Serviço Concluído",
  8: "Entregue ao Cliente",
};

export default function OrderReportPDF({ data, dateRange, company }: any) {
  const totalGeral = data.reduce(
    (acc: any, order: any) =>
      acc + (Number(order.parts_value) + Number(order.service_value)),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <Text style={styles.title}>{company}</Text>
        <Text style={styles.subtitle}>Relatório de Ordens de Serviço</Text>
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
            <Text style={styles.colMedium}>Modelo</Text>
            <Text style={styles.col}>Técnico</Text>
            <Text style={styles.colMedium}>Status</Text>
            <Text style={styles.colRight}>Valor (R$)</Text>
          </View>

          {data.map((order: any) => (
            <View key={order.id} style={styles.tableRow}>
              <Text style={styles.colSmall}>{order.order_number}</Text>
              <Text style={styles.colLarge}>{order.customer?.name || "N/A"}</Text>
              <Text style={styles.colMedium}>{order.model || "—"}</Text>
              <Text style={styles.col}>{order.user?.name || "—"}</Text>
              <Text style={styles.colMedium}>
                {STATUS_MAP[order.service_status] || "—"}
              </Text>
              <Text style={styles.colRight}>
                R$ {maskMoney(String(Number(order.parts_value) + Number(order.service_value)))}
              </Text>
            </View>
          ))}
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>Total de Ordens no período: {data.length}</Text>
          <Text style={styles.totalHighlight}>
            Valor Total: R$ {maskMoney(String(totalGeral))}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
