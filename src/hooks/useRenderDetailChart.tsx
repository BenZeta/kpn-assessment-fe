import { AssessmentData } from "@/types/ReportTypes";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

interface useRenderChartInterface {
  data: AssessmentData;
}

export default function useRenderDetailChart({ data }: useRenderChartInterface) {
  const [readyDetail, setReady] = useState(false);
  const [charts_detail, setChart] = useState({});
  const details = useMemo(() => data?.detail, [data]);

  async function renderToChart(chartContainer: HTMLElement, index: string) {
    let canvas = await html2canvas(chartContainer, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: true,
    });
    setChart(prev => ({ ...prev, [index]: canvas.toDataURL("image/png") }));
  }

  const renderAndCaptureChart = async (
    data: { name: string; value: number; max: number }[],
    chartTitle: string
  ) => {
    return new Promise<void>(async resolve => {
      const chartContainer = document.createElement("div");
      chartContainer.style.backgroundColor = "white";
      chartContainer.style.padding = "10px";
      chartContainer.style.width = "550px";
      document.body.appendChild(chartContainer);

      const root = createRoot(chartContainer);
      root.render(
        <BarChart
          layout="vertical"
          width={500}
          height={300}
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={200} />
          <Bar
            dataKey="value"
            fill="#d32f2f"
            background={{ fill: "#f0f0f0" }}
            radius={0}
            barSize={25}
            isAnimationActive={false}
          >
            <LabelList dataKey="value" position="right" />
          </Bar>
        </BarChart>
      );

      // Wait for React to render
      await new Promise(r => requestAnimationFrame(r));
      // Extra buffer delay to ensure chart is painted
      await new Promise(r => setTimeout(r, 200));

      await renderToChart(chartContainer, chartTitle);

      root.unmount(); // Clean up React root
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
          case "subtest": {
            const prepared_data = detail.subtests.map(value => ({
              name: value.subtest_name,
              value: value.result.subtest_point ?? 0,
              max: 100,
            }));

            await renderAndCaptureChart(prepared_data, `${detail.test_name}`);
            break;
          }

          case "category": {
            for (const subtest of detail.subtests) {
              if (!subtest.result.categories) continue;
              const prepared_data = subtest.result.categories.map(cat => ({
                name: cat.category_name,
                value: cat.category_point ?? 0,
                max: 100,
              }));

              await renderAndCaptureChart(
                prepared_data,
                `${detail.test_name}-${subtest.subtest_name}`
              );
            }
            break;
          }
        }
      }
      setReady(true);
    })();
  }, [data]);
  return { readyDetail, charts_detail };
}
