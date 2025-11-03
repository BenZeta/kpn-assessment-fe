import { Checkbox } from "@mui/material";
import React, { useState } from "react";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";

interface CheckboxComponent {
  value: boolean;
  onClick: (id: string, value: any) => Promise<void>;
  id: string;
}

export default function CheckboxComponent({ value, onClick, id }: CheckboxComponent) {
  const [checked, setChecked] = useState(value);
  const onChange = async () => {
    try {
      await onClick(id, !checked);
      setChecked(prev => !prev);
    } catch (error) {
      let message_error = (error as Error)?.message;
      if (isAxiosError(error)) {
        message_error = error.response?.data.message;
      }
      snack.error(message_error);
    }
  };
  return (
    <Checkbox
      checked={checked}
      onClick={e => {
        onChange();
      }}
    />
  );
}
