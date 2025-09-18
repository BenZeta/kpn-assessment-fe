import { Dialog, DialogActions, Button, DialogTitle, DialogContent } from "@mui/material";
import { useState, useMemo, ReactNode, useRef, useImperativeHandle, forwardRef } from "react";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";

export type RefDialogComponent = {
  setOpen: (value: boolean) => void;
};

interface DialogFormComponentInterface {
  Content: ReactNode;
  onNo?: () => void;
  Title?: string | ReactNode;
  values?: any;
}

const DialogFormComponent = forwardRef<RefDialogComponent, DialogFormComponentInterface>(
  (props, ref) => {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      setOpen,
    }));

    const onNoClick = () => {
      if (props.onNo) {
        props.onNo();
      }
      setOpen(false);
    };

    return (
      <>
        <Dialog open={open} maxWidth="xl">
          <DialogTitle>{props.Title}</DialogTitle>
          {props.Content}

          <DialogActions>
            <Button variant="outlined" color="error" onClick={() => onNoClick()}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

export default DialogFormComponent;
