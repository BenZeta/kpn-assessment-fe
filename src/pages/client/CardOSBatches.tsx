import { Card, Box, Button } from "@mui/material";
import moment from "moment";
import { BatchMain } from "@/types/AssessmentTypes";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function CardOSBatches({ param }: { param: BatchMain }) {
  const navigate = useNavigate();

  const onClickCard = () => {
    navigate(`/client/${param.token}`);
  };
  const start_period = useMemo(() => {
    return moment(param.start_period).format("YYYY-MM-DD HH:mm:ss");
  }, [param.start_period]);

  const end_period = useMemo(() => {
    return moment(param.end_period).format("YYYY-MM-DD HH:mm:ss");
  }, [param.end_period]);
  return (
    <Card variant="outlined">
      <Box sx={{ display: "flex", p: 3, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <h3>{param.batch_name}</h3>
          <strong>({param.batch_code})</strong>
          <p>
            {start_period} - {end_period}
          </p>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <Button
            onClick={() => {
              onClickCard();
            }}
            variant="contained"
          >
            Start
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
