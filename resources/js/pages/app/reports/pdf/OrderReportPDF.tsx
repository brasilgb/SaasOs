import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";
import "moment/dist/locale/pt-br";

moment.locale("pt-br");

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  title: { fontSize: 16, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 11, textAlign: "center", marginBottom: 15 },
  headerInfo: { fontSize: 10, marginBottom: 15, textAlign: "center" },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5px solid #ccc",
    paddingVertical: 2,
  },
  colSmall: { width: "8%", textAlign: "center" },
  colMedium: { width: "20%", textAlign: "left" },
  col: { flex: 1, textAlign: "left" },
  colRight: { width: "15%", textAlign: "right" },
  footer: {
    marginTop: 10,
    borderTop: "1px solid #000",
    paddingTop: 5,
    fontSize: 10,
    textAlign: "center",
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

export default function OrderReportPDF({ data, dateRange }: any) {
  const totalGeral = data.reduce(
    (acc:any, order: any) => acc + (Number(order.parts_value) + Number(order.service_value)),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Minha Empresa</Text>
        <Text style={styles.subtitle}>Relatório de Ordens de Serviço</Text>
        <Text style={styles.headerInfo}>
          Período: {moment(dateRange.from).format("DD/MM/YYYY")} -{" "}
          {moment(dateRange.to).format("DD/MM/YYYY")}{"\n"}
          Emitido em: {moment().format("DD/MM/YYYY HH:mm")}
        </Text>

        <View style={styles.tableHeader}>
          <Text style={styles.colSmall}>#</Text>
          <Text style={styles.colMedium}>Cliente</Text>
          <Text style={styles.colMedium}>Modelo</Text>
          <Text style={styles.col}>Técnico</Text>
          <Text style={styles.colMedium}>Status</Text>
          <Text style={styles.colRight}>Valor (R$)</Text>
        </View>

        {data.map((order: any) => (
          <View key={order.id} style={styles.tableRow}>
            <Text style={styles.colSmall}>{order.order_number}</Text>
            <Text style={styles.colMedium}>{order.customer?.name || "N/A"}</Text>
            <Text style={styles.colMedium}>{order.model || "—"}</Text>
            <Text style={styles.col}>{order.user.name || "—"}</Text>
            <Text style={styles.colMedium}>
              {STATUS_MAP[order.service_status] || "—"}
            </Text>
            <Text style={styles.colRight}>
              {(Number(order.parts_value) + Number(order.service_value)).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text>Total de Ordens: {data.length}</Text>
          <Text>Valor Total: R$ {totalGeral.toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  );
}
