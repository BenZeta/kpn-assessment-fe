import { Card, Box, Button, Typography, Chip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
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

  const now = moment();
  const startDate = moment(param.start_period);
  const endDate = moment(param.end_period);

  const isBeforeStart = now.isBefore(startDate);
  const isAfterEnd = now.isAfter(endDate);
  const isDisabled = isBeforeStart || isAfterEnd;

  const onClickCard = () => {
    if (!is_complete && !token_drw) {
      snack.error("Please complete identity first");
      return;
    }

    if (isBeforeStart) {
      snack.warning("Batch period has not started yet");
      return;
    }

    if (isAfterEnd) {
      snack.warning("Batch period already ended");
      return;
    }

    navigate(`/client/${param.token}`);
  };

  const start_period = useMemo(() => {
    return startDate.format("D MMM YYYY, HH:mm");
  }, [param.start_period]);

  const end_period = useMemo(() => {
    return endDate.format("D MMM YYYY, HH:mm");
  }, [param.end_period]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "info";
      case "Not Taken":
      default:
        return "warning";
    }
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 2, p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {param.batch_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({param.batch_code})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {start_period} – {end_period}
          </Typography>
          <Chip
            label={param.progress.status}
            color={getStatusColor(param.progress.status)}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
        <Button
          onClick={onClickCard}
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          disabled={isDisabled}
        >
          Start
        </Button>
      </Box>
    </Card>
  );
}
