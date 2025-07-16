import { Typography, Box } from "@mui/material";
import React from "react";
import CaraouselCardCover from "./CaraouselCardCover";
import CardCoverField from "./CardCoverField";

type CoverPageProps = {
  control?: any;
};

const CoverPage: React.FC<CoverPageProps> = ({ control }) => {
  return (
    <>
      <Typography variant="h6" color="textSecondary" fontWeight={600} sx={{ mb: 2 }}>
        Cover
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box
          sx={theme => ({
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 2,
            backgroundColor: theme.palette.grey[200],
          })}
        >
          <Typography fontWeight="600" color="primary">
            Chosen
          </Typography>

          <CardCoverField name="cover_id" control={control} />
        </Box>

        <Box
          sx={{
            height: "26rem",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            flexGrow: 1,
            py: 1,
          }}
        >
          <CaraouselCardCover />
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <em>Choose Report Cover</em>
          </Box>
        </Box>
      </Box>
    </>
  );
};
export default CoverPage;
