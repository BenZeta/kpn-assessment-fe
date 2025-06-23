import { mockResult } from "@/assets/mockqnaclient";
import useFetch from "@/hooks/useFetch";
import useAPI from "@/hooks/useAPI";
import { useRenderPDF } from "@/worker/useRenderPDF";
import html2canvas from "html2canvas";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useSearchParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

type PreviewProps = {
  control?: any;
  batchId?: string;
};

const Preview: React.FC<PreviewProps> = ({ batchId }) => {
  const [pdfData, setPDFData] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [searchParams] = useSearchParams();
  const api = useAPI();

  const batch_id = searchParams.get("batch_id") ?? "";
  const assessee_id = searchParams.get("assessee_id") ?? "";
  const assessee_email = searchParams.get("assessee_email") ?? "";

  useEffect(() => {
    if (!batch_id || !assessee_id || !assessee_email) {
      return;
    }

    const payload = {
      batch_id,
      assessee_id,
      assessee_email,
    };

    (async () => {
      try {
        const { data } = await api.post("report/pdfgen", payload, { responseType: "blob" });
        const pdfBlob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(pdfBlob);
        setPDFData(url);
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError(err as Error);
      }
    })();
    return () => {
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [batch_id, assessee_id, assessee_email, api]);

  if (error) {
    console.error("Error rendering PDF:", error);
    return <h2>Error loading PDF</h2>;
  }
  return !pdfData ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "400px",
      }}
    >
      <h2>Loading PDF...</h2>
      <p>Rendering charts and generating PDF document</p>
    </div>
  ) : (
    <iframe src={pdfData} style={{ width: "100%", height: "800px" }} title="PDF Preview" />
  );
};
export default Preview;
