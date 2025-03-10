"use client";

import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { Controller } from "react-hook-form";

const DatePickerCtrl = ({ name, label, control, rules, onChange }) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value }, fieldState: { error } }) => (
        <DatePicker
          onChange={onChange}
          sx={{ width: "100%", mb: 2 }}
          value={moment(value)}
          label={label}
          slotProps={{
            textField: { error: !!error, helperText: error?.message },
          }}
          format="DD/MM/YYYY"
        />
      )}
    ></Controller>
  );
};

export default DatePickerCtrl;
