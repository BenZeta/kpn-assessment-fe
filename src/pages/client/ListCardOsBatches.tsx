import CardOSBatches from "./CardOSBatches";
import useGetAssessmentData from "@/hooks/useGetAssessmentData";
import { Box, Skeleton } from "@mui/material";

export default function ListCardOsBatches() {
  const { data, error, loading } = useGetAssessmentData();
  return (
    <>
      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Skeleton
            variant="rectangular"
            sx={theme => ({
              [theme.breakpoints.up("sm")]: {
                width: "100%",
              },
              width: "100vw",
              height: "5rem",
            })}
          />
          <Skeleton
            variant="rectangular"
            sx={theme => ({
              [theme.breakpoints.up("sm")]: {
                width: "100%",
              },
              width: "100vw",
              height: "5rem",
            })}
          />
          <Skeleton
            variant="rectangular"
            sx={theme => ({
              [theme.breakpoints.up("sm")]: {
                width: "100%",
              },
              width: "100vw",
              height: "5rem",
            })}
          />
        </Box>
      )}
      {data.length == 0 && !loading && !error && <h3>Data is Empty</h3>}
      {data.length > 0 && data.map(value => <CardOSBatches param={value} key={value.batch_id} />)}
    </>
  );
}
