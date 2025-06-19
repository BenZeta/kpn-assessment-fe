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
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Block sx={{ width: "20rem" }} />
        <h2>The selected window cannot be shared </h2>
        <h4>Please share your entire screen where the test is being conducted</h4>
        <h4>
          <em>Click "Check Screen Share" again and select "Entire Screen"</em>
        </h4>
        <Button onClick={e => setOpen(false)}>Ok</Button>
      </Box>
    </Dialog>
  );
};

export default DialogNotWantedScreenShare;
