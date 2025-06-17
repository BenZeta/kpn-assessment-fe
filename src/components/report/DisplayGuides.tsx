import {
  Popper,
  Paper,
  Box,
  Button,
  Skeleton,
  Card,
  IconButton,
  Typography,
  ClickAwayListener,
} from "@mui/material";
import { RefreshOutlined } from "@mui/icons-material";
import { CloseOutlined } from "@mui/icons-material";
import { useCallback, useRef, forwardRef, useImperativeHandle, useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import useFetch from "@/hooks/useFetch";
import CardDataIntroReport from "./CardDataIntroReport";
import { MockReportAssessment } from "@/assets/mockqnaclient";

export type RefDisplayReportGuides = {
  openModal: () => void;
};

interface PropsDisplayReportGuides {
  anchorEl: HTMLElement | HTMLButtonElement | null;
}

const DisplayReportGuides = forwardRef<RefDisplayReportGuides, PropsDisplayReportGuides>(
  ({ anchorEl }, ref) => {
    useImperativeHandle(
      ref,
      () => ({
        openModal: () => {
          setOpen(true);
        },
      }),
      []
    );
    const [open, setOpen] = useState(false);
    const rowHeights = useRef<any>({});
    const listRef = useRef<VariableSizeList>(null);
    const { loading, error, data, refetch } = useFetch("/report/guide");
    const dataRT = useMemo(() => data?.data ?? [], [data]);

    const setRowsHeights = useCallback((index: any, size: any) => {
      if (listRef.current) {
        listRef.current.resetAfterIndex(0);
        rowHeights.current = { ...rowHeights.current, [index]: size };
      }
    }, []);

    // useEffect(() => {
    //   // if (open) {
    //   //   setAuthorize(() => showData);
    //   // }
    // }, [ open]);

    const Row = ({ index, style }: { index: any; style: any }) => {
      return (
        <CardDataIntroReport
          key={dataRT[index].id}
          index={index}
          style={style}
          richtext={dataRT[index].content}
          setRowHeights={setRowsHeights}
        />
      );
    };

    function getRowHeight(index: number) {
      return rowHeights.current[index] + 10 || 100;
    }

    return (
      <Popper
        open={open}
        anchorEl={anchorEl}
        sx={theme => ({ zIndex: theme.zIndex.appBar + 1000, position: "absolute" })}
        modifiers={[
          {
            options: {
              rootBoundary: "document",
            },
          },
        ]}
        placement="right-end"
      >
        <Paper
          sx={theme => ({
            display: "flex",
            flexDirection: "column",
            gap: 2,
            [theme.breakpoints.up("lg")]: {
              width: "40rem",
            },
            [theme.breakpoints.up("md")]: {
              width: "30rem",
            },
            height: "70vh",
            p: 2,
            backgroundColor: theme.palette.grey[200],
          })}
          elevation={10}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              sx={{ minWidth: "10px", mp: 5 }}
              onClick={e => {
                setOpen(false);
              }}
            >
              <CloseOutlined />
            </Button>
          </Box>
          <Box
            sx={{
              height: "90%",
              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
                height: "100%",
                flexShrink: 0,
              }}
            >
              {loading && (
                <>
                  <Skeleton variant="rectangular" sx={{ width: "100%", height: "10rem" }} />
                  <Skeleton variant="rectangular" sx={{ width: "100%", height: "10rem" }} />
                  <Skeleton variant="rectangular" sx={{ width: "100%", height: "10rem" }} />
                </>
              )}
              {error && (
                <Card
                  sx={theme => ({
                    width: "100%",
                    height: "15rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.palette.error.light,
                  })}
                >
                  <Typography sx={theme => ({ color: theme.palette.error.contrastText })}>
                    Error Occured
                  </Typography>
                  <IconButton
                    sx={theme => ({ color: theme.palette.error.contrastText })}
                    onClick={() => refetch()}
                  >
                    <RefreshOutlined />
                  </IconButton>
                </Card>
              )}
              {dataRT && dataRT?.length == 0 && (
                <Card
                  sx={theme => ({
                    width: "100%",
                    height: "15rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.palette.grey[300],
                  })}
                >
                  <h4>Empty Data</h4>
                </Card>
              )}
              {dataRT && dataRT?.length > 0 && (
                <AutoSizer style={{ height: "100%", width: "100%" }}>
                  {({ height, width }) => (
                    <VariableSizeList
                      height={height}
                      width={width}
                      itemCount={dataRT.length}
                      itemSize={getRowHeight}
                      ref={listRef}
                    >
                      {Row}
                    </VariableSizeList>
                  )}
                </AutoSizer>
              )}
            </Box>
          </Box>
        </Paper>
      </Popper>
    );
  }
);

export default DisplayReportGuides;
