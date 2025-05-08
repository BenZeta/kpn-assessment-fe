import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Control, Controller } from "react-hook-form";
import { SxProps } from "@mui/material";

interface DatePickerCtrlProps {
  name: string;
  label: string;
  control: Control<any>;
  onChangeOvr?: any;
  size?: "small" | "medium";
  sx: SxProps;
  format?: string;
  rules?: {
    required: string;
    validate?: (value: any, formValues: any) => boolean | string;
  };
}

const DatePickerCtrl: React.FC<DatePickerCtrlProps> = ({
  name,
  label,
  control,
  rules,
  onChangeOvr,
  size,
  sx,
  format,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <DatePicker
          sx={sx}
          label={label}
          value={value}
          onChange={e => {
            onChange(e);
            if (onChangeOvr !== undefined) {
              onChangeOvr(e);
            }
          }}
          slotProps={{
            textField: { error: !!error, helperText: error?.message, size: size },
          }}
          format={format ?? "DD/MM/YYYY"}
        />
      )}
    />
  );
};
export default DatePickerCtrl;
