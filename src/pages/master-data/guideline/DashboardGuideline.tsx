import { useEffect, useMemo, useRef, useState } from "react";
import CustomTable from "@/components/CustomTable";
import { Divider, Box, Button, IconButton, Tooltip, Typography, Paper } from "@mui/material";
import useFetch from "@/hooks/useFetch";
import useAPI from "@/hooks/useAPI";
import { MRT_ColumnDef } from "material-react-table";
import moment from "moment";
import { snack } from "@/providers/SnackbarProvider";
import { AxiosResponse, isAxiosError } from "axios";
import SwitchStyled from "@/components/SwitchStyled";
import { Delete, Preview } from "@mui/icons-material";
import { useLoading } from "@/providers/LoadingProvider";
import DialogFormComponent, { RefDialogComponent } from "@/components/common/DialogComponent";

type Guideline = {
  uid: string;
  guideline_name: string;
  create_at: string;
  create_by: string;
  selected: boolean;
  function_test: string | null;
};

function ModalPreviewPDFGuideline({ pdf }: { pdf: string }) {
  return (
    <Box sx={{ width: "90vw", height: "70vh", p: 1 }}>
      <iframe src={pdf ?? ""} style={{ width: "100%", height: "100%" }}></iframe>
    </Box>
  );
}

export default function DashboardGuideline() {
  const [previewGuideline, setPreviewGuideline] = useState("");
  const [GuidelinePreview, setGuidelinePreview] = useState("");
  const refModalPreview = useRef<RefDialogComponent>(null);
  const { data, loading, error, refetch } = useFetch<any>("/guideline");

  const { showLoading, hideLoading } = useLoading();
  const [fileGuideline, setFileGuideline] = useState<string | null>(null);
  const api = useAPI();

  useEffect(() => {
    (async () => {
      try {
        const { data: DataFile } = await api.get("/guideline/getfile", { responseType: "blob" });
        setFileGuideline(URL.createObjectURL(DataFile));
        return;
      } catch (error) {
        if (isAxiosError(error)) {
          snack.error(error.response?.data.message);
        } else {
          snack.error((error as Error).message);
        }
      }
    })();
  }, [data]);

  useEffect(() => {
    (async () => {
      try {
        const { data: DataFile } = await api.get("/guideline/getfile/" + previewGuideline, {
          responseType: "blob",
        });
        setGuidelinePreview(URL.createObjectURL(DataFile));
        return;
      } catch (error) {
        if (isAxiosError(error)) {
          snack.error(error.response?.data.message);
        } else {
          snack.error((error as Error).message);
        }
      }
    })();
  }, [previewGuideline]);

  const rows = useMemo(() => {
    return data?.data || [];
  }, [data]);
  const row = useMemo(() => data?.data ?? [], [data]);

  const UploadGuideline = async (e: any) => {
    try {
      showLoading();
      const fd = new FormData();
      const file = e.target?.files?.[0];
      if (!file) {
        throw new Error("File not uploaded");
      }
      fd.append("guideline", file);
      // console.log(fd);
      const { data }: AxiosResponse<{ message: string; data: any }> = await api.post(
        "/guideline",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      snack.success(data.message);
      refetch();
    } catch (error) {
      console.log(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      } else {
        snack.error((error as Error).message);
      }
    } finally {
      hideLoading();
    }
  };
  const SelectGuideline = async (file_id: string) => {
    try {
      showLoading();
      const { data }: AxiosResponse<{ message: string; data: any }> = await api.post(
        `guideline/select`,
        {
          id_file: file_id,
        }
      );
      snack.success(data.message);
      refetch();
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      } else {
        snack.error((error as Error).message);
      }
    } finally {
      hideLoading();
    }
  };

  const DeleteGuideline = async (file_id: string) => {
    try {
      const { data }: AxiosResponse<{ message: string; result: any }> = await api.delete(
        "/guideline",
        {
          data: {
            id_file: file_id,
          },
        }
      );
      snack.success(data.message);
      refetch();
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      } else {
        snack.error((error as Error).message);
      }
    }
  };
  const columns = useMemo<MRT_ColumnDef<Guideline>[]>(() => {
    return [
      {
        accessorKey: "guideline_name",
        header: "Guideline File",
      },
      {
        accessorKey: "create_at",
        header: "Uploaded At",
        Cell: ({ cell }) => {
          return moment(cell.getValue<string>()).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      {
        accessorKey: "create_by",
        header: "Uploaded By",
      },
      {
        id: "action",
        header: "Action",
        Cell: ({ row }) => {
          const data = row.original;
          return (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Tooltip title="Select Guideline">
                <SwitchStyled
                  disabled={data.selected}
                  checked={data.selected}
                  onClick={e => {
                    SelectGuideline(row.original.uid);
                  }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => {
                    DeleteGuideline(row.original.uid);
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
              <Tooltip title="Preview">
                <IconButton
                  onClick={() => {
                    setPreviewGuideline(row.original.uid);
                    refModalPreview.current?.setOpen(true);
                  }}
                >
                  <Preview />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, []);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <input
          type="file"
          accept=".pdf"
          id="upload-file"
          onChange={e => {
            UploadGuideline(e);
          }}
          hidden
        />
        <label htmlFor="upload-file">
          <Button component="span" sx={{ m: 1 }} variant="contained">
            + Upload File
          </Button>
        </label>
      </Box>
      <CustomTable data={rows} columns={columns} />
      <Paper sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", p: 3 }}>
        <Typography variant="h4">Current Selected</Typography>
        <Divider variant="fullWidth" />
        <Box sx={{ width: "100%" }}>
          <iframe src={fileGuideline ?? ""} style={{ width: "100%", height: "300px" }} />
        </Box>
      </Paper>
      <DialogFormComponent
        ref={refModalPreview}
        Content={<ModalPreviewPDFGuideline pdf={GuidelinePreview} />}
        Title={"Preview Guideline"}
        onNo={() => {
          setGuidelinePreview("");
        }}
      />
    </Box>
  );
}
