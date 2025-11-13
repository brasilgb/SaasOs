import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import moment from "moment";
import { pdf } from "@react-pdf/renderer"; // componente do PDF
import { router } from "@inertiajs/react";
import SchedulesReportPDF from "./pdf/SchedulesReportPDF";

interface DateRange {
  from?: Date;
  to?: Date;
}

export default function SchedulesReport({ dateRange }: { dateRange?: DateRange }) {
  const [loading, setLoading] = useState(false);

  async function handleGeneratePDF() {
    if (!dateRange?.from || !dateRange?.to) return;
    setLoading(true);

    router.post(
      route("app.reports.store"),
      {
        type: "schedules",
        from: moment(dateRange.from).format("YYYY-MM-DD"),
        to: moment(dateRange.to).format("YYYY-MM-DD"),
      },
      {
        preserveState: false,
        preserveScroll: true,
        onSuccess: async (page: any) => {
          const reportData = page.props?.reportData || [];

          // Gera o PDF no frontend
          const blob = await pdf(
            <SchedulesReportPDF data={reportData} dateRange={dateRange} />
          ).toBlob();

          const url = URL.createObjectURL(blob);
          window.open(url, "_blank"); // abre em nova aba
        },
        onError: (errors) => {
          console.error("Erro ao gerar relatório:", errors);
        },
        onFinish: () => setLoading(false),
      }
    );
  }

  return (
    <div className="flex justify-center mt-4">
      <Button
        onClick={handleGeneratePDF}
        disabled={loading || !dateRange?.from || !dateRange?.to}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Gerando PDF...
          </>
        ) : (
          <>
            <FileText className="mr-2 size-4" />
            Agendamentos de visitas
          </>
        )}
      </Button>
    </div>
  );
}
