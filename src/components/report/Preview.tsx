import { mockResult } from "@/assets/mockqnaclient";
import useAPI from "@/hooks/useAPIDarwin";
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

function useRenderChart({
  setChart,
  setReady,
  details,
}: {
  setChart: (value: any) => void;
  setReady: (value: any) => void;
  details: any[];
}) {
  async function renderToChart(chartContainer: HTMLElement, index: string) {
    let canvas = await html2canvas(chartContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    setChart(prev => ({ ...prev, [index]: canvas.toDataURL("image/png") }));
  }
  const renderAndCaptureChart = async (data, chartTitle) => {
    return new Promise<void>(async resolve => {
      const chartContainer = document.createElement("div");
      chartContainer.style.backgroundColor = "white";
      chartContainer.style.padding = "10px";
      chartContainer.style.width = "550px";
      document.body.appendChild(chartContainer);

      const root = createRoot(chartContainer);
      root.render(
        <BarChart
          // layout="vertical"
          width={500}
          height={100}
          data={data}
          // margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          margin={{ top: 2, right: 25, left: 25, bottom: 0 }}
        >
          <CartesianGrid
            stroke="#e0e0e0"
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
          />
          {/* <XAxis type="number" domain={[0, 100]} /> */}
          <XAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ fontSize: 10 }}
            height={40}
          />
          {/* <YAxis dataKey="name" type="category" width={200} /> */}
          <YAxis
            type="number"
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
          />
          <Bar
            dataKey="value"
            fill="#d32f2f"
            radius={[4, 4, 0, 0]}
            barSize={80}
            isAnimationActive={false}
          >
            <LabelList dataKey="value" position="top" offset={8} />
          </Bar>
        </BarChart>
      );

      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => setTimeout(r, 200));

      await renderToChart(chartContainer, chartTitle);

      root.unmount();
      document.body.removeChild(chartContainer);
      resolve();
    });
  };

  useEffect(() => {
    (async () => {
      if (!details) return;

      for (const detail of details) {
        const summary_type = detail.summary_type;

        switch (summary_type) {
          case "category": {
            const prepared_data: any[] = [];

            detail.subtests.forEach((subtest: any) => {
              const categories = subtest.result?.categories ?? subtest.result?.category ?? [];

              categories.forEach((cat: any) => {
                prepared_data.push({
                  name: cat.category_code,
                  value: cat.category_point ?? cat.point ?? 0,
                  max: 100,
                });
              });
            });

            if (prepared_data.length > 0) {
              await renderAndCaptureChart(prepared_data, "OCEAN");
            }
            break;
          }

          // case "subtest": {
          //   for (const subtest of detail.subtests) {
          //     const prepared_data = subtest.result.categories.map(cat => ({
          //       name: cat.category_name,
          //       value: cat.category_point,
          //       max: 100,
          //     }));

          //     await renderAndCaptureChart(
          //       prepared_data,
          //       `${detail.test_name}-${subtest.subtest_name}`
          //     );
          //   }
          //   break;
          // }
        }
      }

      setReady(true);
    })();
  }, [details]);
}

const Preview: React.FC<PreviewProps> = ({ batchId }) => {
  const [charts, setChart] = useState<Record<string, string>>({});
  const [docReady, setReady] = useState(false);
  const [searchParams] = useSearchParams();
  const [apiData, setApiData] = useState<any | null>(null);
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
        const { data } = await api.post("report/result", payload);
        setApiData(data.data);
      } catch (err) {
        console.error("Error fetching report data:", err);
      }
    })();
  }, [batch_id, assessee_id, assessee_email, api]);


  const detail_section = apiData?.detail ?? null;
  useRenderChart({ setChart: setChart, setReady: setReady, details: detail_section });
  const { url, loading, error } = useRenderPDF({
    // data: apiData,
    data: mockResult.data,
    charts: charts,
    ready: docReady,
  });
  console.log("this is url", url);
  if (error) {
    console.error("Error rendering PDF:", error);
    return <h2>Error loading PDF</h2>;
  }
  return loading ? (
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
    <iframe src={url} style={{ width: "100%", height: "800px" }} title="PDF Preview" />
  );
};
export default Preview;
