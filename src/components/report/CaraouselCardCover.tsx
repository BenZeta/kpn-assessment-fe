import useFetch from "@/hooks/useFetch";
import CardCover from "./CardCover";
import { useState, useRef, useCallback, useMemo } from "react";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import useAPI from "@/hooks/useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import { useFormContext } from "react-hook-form";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DialogFormConfirmation, { RefDialogConfirmation } from "../common/DialogFormConfirmation";

const ContentConfirmationCard = ({ batch_data }: { batch_data: any[] }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 3 }}>
      <Typography variant="h4">
        Some batch report is currently using this cover, delete cover?
      </Typography>
      <em>If deleted, report's cover will be set with another last added existing cover</em>
      <p>Batches are using this cover :</p>
      <ul>
        {batch_data.map(item => {
          return <li>{`${item.batch_code} - ${item.batch_name}`}</li>;
        })}
      </ul>
    </Box>
  );
};

const CaraouselCardCover = () => {
  const [loading, setLoading] = useState(false);
  const [batch_usingcov, setIsUseCov] = useState<any[]>([]);
  const dialogForm = useRef<RefDialogConfirmation>(null);
  const { setValue, getValues } = useFormContext();
  const rowHeights = useRef<any>({});
  const listRef = useRef<VariableSizeList>(null);
  const api = useAPI();
  const {
    data: datacovers,
    error,
    loading: loadingCovers,
    refetch,
  } = useFetch<{ data: { uid: string }[] }>(`/report/allcover`);
  const covers = useMemo(() => (datacovers ? datacovers.data : []), [datacovers]);
  const setRowsHeights = useCallback((index: any, size: any) => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
      rowHeights.current = { ...rowHeights.current, [index]: size };
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      if (!e.target.files) {
        throw new Error("File not chosen");
      }
      const fd = new FormData();
      fd.append("cover", e.target.files[0]);
      const { data } = await api.post(`/report/uploadcover`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setValue("cover_id", data.id_file);
      snack.success("File uploaded");
      refetch();
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      } else {
        snack.error((error as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIsExistToOtherReport = async () => {
    try {
      setLoading(true);
      const batch_id = getValues("batch_id");
      const cover_id = getValues("cover_id");
      const { data } = await api.get(
        `/report/cover/isexist?batch_id=${batch_id}&cover_id=${cover_id}`
      );
      if (data.data.is_used) {
        setIsUseCov(data.data.batch_using);
        return true;
      }
      setIsUseCov([]);
      return false;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const coverId = getValues("cover_id");
      if (!coverId) {
        snack.error("No cover selected");
        return;
      }
      await api.delete(`/report/cover/${coverId}`);
      snack.success("Cover deleted successfully");
      setValue("cover_id", "");
      refetch();
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      } else {
        snack.error((error as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ index, style }: { index: any; style: any }) => {
    return (
      <CardCover
        id={covers[index].uid}
        key={covers[index].uid}
        index={index}
        style={style}
        setRowHeights={setRowsHeights}
      />
    );
  };

  function getRowHeight(index: number) {
    return rowHeights.current[index] + 20 || 100;
  }
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button variant="contained" component="label" loading={loading}>
            <input type="file" onChange={handleFileChange} hidden accept="image/png, image/jpeg" />+
            Add Cover
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteForeverIcon />}
            onClick={async () => {
              const result = await handleCheckIsExistToOtherReport();
              // console.log(result);
              if (result) {
                if (dialogForm.current) {
                  dialogForm.current.setOpen(true);
                }
              } else {
                handleDelete();
              }
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      <>
        <DialogFormConfirmation
          ref={dialogForm}
          onYes={handleDelete}
          Content={<ContentConfirmationCard batch_data={batch_usingcov} />}
        />
      </>
      <Box sx={{ flexGrow: 1, height: 350 }}>
        <AutoSizer style={{ width: "100%", height: "100%" }}>
          {({ height, width }) =>
            loadingCovers ? (
              <Box sx={{ display: "flex", gap: 2, p: 1, width }}>
                {[...Array(4)].map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    width={250}
                    height={297}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>
            ) : (
              covers &&
              covers?.length > 0 && (
                <VariableSizeList
                  height={height}
                  width={width}
                  itemCount={covers.length}
                  itemSize={getRowHeight}
                  ref={listRef}
                  layout="horizontal"
                >
                  {Row}
                </VariableSizeList>
              )
            )
          }
        </AutoSizer>
      </Box>
    </>
  );
};

export default CaraouselCardCover;
