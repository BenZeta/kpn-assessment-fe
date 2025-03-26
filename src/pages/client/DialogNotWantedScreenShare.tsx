import { Dialog, Button, Box } from "@mui/material";
import { Block } from "@mui/icons-material";

import { forwardRef, useImperativeHandle, useState } from "react";

export interface DialogNotWantedScreenShareInt {
  setOpen: (value: boolean) => void;
  open: boolean;
}

type Props = {};

const DialogNotWantedScreenShare = ({ open, setOpen }: DialogNotWantedScreenShareInt) => {
  return (
    <Dialog open={open} maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Block sx={{ width: "20rem" }} />
        <h2>Not allowed to share window</h2>
        <h4>Please share entire screen which test being held</h4>
        <h4>
          <em>Click "Check Screen Share" once again</em>
        </h4>
        <Button onClick={e => setOpen(false)}>Ok</Button>
      </Box>
    </Dialog>
  );
};

export default DialogNotWantedScreenShare;
