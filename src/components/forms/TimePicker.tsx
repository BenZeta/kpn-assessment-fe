import React from "react";
import { Control, Controller } from "react-hook-form";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

type TimePickerCtrlProps = {
  name: string;
  label: string;
  control: Control<any>;
  rules?: any;
  defaultValue?: string;
  onChangeOvr?: any;
  sx?: any;
};

const TimePickerCtrl: React.FC<TimePickerCtrlProps> = ({
  name,
  label,
  control,
  rules,
  defaultValue,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TimePicker
          label={label}
          // defaultValue={defaultValue}
          onChange={() => onChange}
          slotProps={{
            textField: { error: !!error, helperText: error?.message },
          }}
        />
      )}
    />
  );
};
export default TimePickerCtrl;
