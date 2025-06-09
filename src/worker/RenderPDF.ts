import { createElement } from "react";
import axios from "axios";

export const RenderPDF = async ({
  data,
  charts,
  accessToken,
  apiBaseUrl
}: {
  data: any;
  charts: Record<string, string>;
  accessToken: string;
  apiBaseUrl: string; // opsional, jika ingin menggunakan base URL yang berbeda
}): Promise<Blob> => {
  // --------------------------------------------
  // 1) Siapkan instansi axios dengan header Authorization
  // --------------------------------------------
  const instance = axios.create({
    // baseURL: import.meta.env.VITE_API_URL,
    baseURL: apiBaseUrl, 
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    responseType: "blob", // nanti kita minta blob untuk gambar
  });
  // console.log("ini data", data);


  // --------------------------------------------
  // 2) Fungsi bantu: Blob -> Data URL (base64)
  // --------------------------------------------
  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result adalah string "data:image/png;base64,….."
        resolve(reader.result as string);
      };
      reader.onerror = err => reject(err);
      reader.readAsDataURL(blob);
    });
  };

  // --------------------------------------------
  // 3) Fetch semua gambar "web_cam" & "screen"
  // --------------------------------------------
  // data.proctoring.web_cam = Array<{ key: string; lastModified: string }>
  // data.proctoring.screen  = Array<{ key: string; lastModified: string }>

  // Jika proctoring atau webs_cam/screen mungkin undefined, guard terlebih dahulu:
  const webCamItems = Array.isArray(data.proctoring?.web_cam) ? data.proctoring.web_cam : [];
  const screenItems = Array.isArray(data.proctoring?.screen) ? data.proctoring.screen : [];

  // Buat array Promise untuk masing‐masing key
  const fetchWebcamPromises: Promise<{ key: string; dataUrl: string }>[] = webCamItems.map(
    async (item: { key: string; lastModified: string }) => {
      // Endpoint: GET /api/report/proctoring?path=<encodedKey>
      const url = `/report/proctoring?path=${encodeURIComponent(item.key)}`;
      const response = await instance.get(url);
      const blob = response.data as Blob;
      const dataUrl = await blobToDataURL(blob);
      return { key: item.key, blob };
    }
  );

  const fetchScreenPromises: Promise<{ key: string; dataUrl: string }>[] = screenItems.map(
    async (item: { key: string; lastModified: string }) => {
      const url = `/report/proctoring?path=${encodeURIComponent(item.key)}`;
      const response = await instance.get(url);
      const blob = response.data as Blob;
      const dataUrl = await blobToDataURL(blob);
      return { key: item.key, blob };
    }
  );

  // Tunggu semua selesai
  let webcamResults: Array<{ key: string; blob: Blob }>;
  let screenResults: Array<{ key: string; blob: Blob }>;

  try {
    [webcamResults, screenResults] = await Promise.all([
      Promise.all(fetchWebcamPromises),
      Promise.all(fetchScreenPromises),
    ]);
  } catch (err) {
    console.error("Gagal fetch salah satu gambar proctoring:", err);
    // Jika fetch salah satu gambar gagal, Anda bisa memutuskan:
    //  - Lempar error, sehingga PDF tidak jadi dirender, atau
    //  - Tangani secara “graceful” dengan membiarkan array kosong untuk salah satu bagian.
    throw err;
  }

  // Ambil hanya dataUrl (urutannya sama dengan data.proctoring.web_cam dan data.proctoring.screen)
  const webcamDataUrls = await Promise.all(
    webcamResults.map(async r => await blobToDataURL(r.blob))
  );
  const screenDataUrls = await Promise.all(
    screenResults.map(async r => await blobToDataURL(r.blob))
  );
  console.log("webcamDataUrls", webcamDataUrls);
  console.log("screenDataUrls", screenDataUrls);
  // --------------------------------------------
  // 4) Merge dataWithImages → kita tambahkan field baru di data
  // --------------------------------------------
  const dataWithImages = {
    ...data,
    proctoringImages: {
      webcam: webcamDataUrls,
      screen: screenDataUrls,
    },
  };

  // --------------------------------------------
  // 5) Import React-PDF dan komponen PDF
  // --------------------------------------------
  const { pdf } = await import("@react-pdf/renderer");
  const { AssessmentReportPDF } = await import("@/components/report/template/AssessmentReportPDF");

  // --------------------------------------------
  // 6) Render PDF → hasilnya diteruskan sebagai Blob
  // --------------------------------------------
  // createElement(AssessmentReportPDF, { data: dataWithImages, charts })
  const reactPdfElement = createElement(AssessmentReportPDF, {
    data: dataWithImages,
    charts: charts,
  });

  // .toBlob() mengembalikan Promise<Blob>
  const blobPDF = await pdf(reactPdfElement).toBlob();
  return blobPDF;
};
