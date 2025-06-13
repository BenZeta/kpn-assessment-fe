import useFetch from "@/hooks/useFetch";
import CardCover from "./CardCover";
import { useState, useRef, useCallback, useMemo } from "react";
import { Box, Button } from "@mui/material";
import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import useAPI from "@/hooks/useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import { useFormContext } from "react-hook-form";

const CaraouselCardCover = () => {
  const [loading, setLoading] = useState(false);
  const { setValue, getValues } = useFormContext();
  const rowHeights = useRef<any>({});
  const listRef = useRef<VariableSizeList>(null);
  const api = useAPI();
  const {
    data: datacovers,
    error,
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
        <Button variant="contained" component="label" loading={loading}>
          <input type="file" onChange={handleFileChange} hidden accept="image/png, image/jpeg" />+
          Add Cover
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {covers && covers?.length > 0 && (
          <AutoSizer style={{ width: "100%", height: "100%" }}>
            {({ height, width }) => (
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
            )}
          </AutoSizer>
        )}
      </Box>
    </>
  );
};

export default CaraouselCardCover;
