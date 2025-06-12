import { Card, Box, Button } from "@mui/material";
import moment from "moment";
import { BatchMain } from "@/types/AssessmentTypes";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAuthExternStore from "@/hooks/useAuthExternStore";
import { snack } from "@/providers/SnackbarProvider";
import useTokenDarwin from "@/hooks/useTokenDarwin";

export default function CardOSBatches({ param }: { param: BatchMain }) {
  const navigate = useNavigate();
  const is_complete = useAuthExternStore(state => state.is_complete);
  const token_drw = useTokenDarwin(state => state.token_drw);

  const onClickCard = () => {
    if (!is_complete && !token_drw) {
      snack.error("Please complete identity first");
      return;
    }
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
