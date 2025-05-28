import { createElement } from "react";
import { mockResult } from "@/assets/mockqnaclient";

export const RenderPDF = async ({ data, charts }) => {
  const { pdf } = await import("@react-pdf/renderer");
  const { AssessmentReportPDF } = await import("@/components/report/template/AssessmentReportPDF");
  // @ts-ignore
  return pdf(createElement(AssessmentReportPDF, { data: data, charts: charts })).toBlob();
};
