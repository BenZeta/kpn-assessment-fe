import { InputAdornment, TextField } from "@mui/material";
import React from "react";
import { Control, Controller } from "react-hook-form";
import { RiCopperCoinFill } from "react-icons/ri";

type PointFieldProps = {
  name: string;
  control: Control<any>;
  disabled?: boolean;
};

const PointField: React.FC<PointFieldProps> = ({ name, control, disabled }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          variant="filled"
          size="small"
          label="Points"
          type="number"
          disabled={disabled}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <RiCopperCoinFill size={24} color="#FFA000" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "130px",
            "& .MuiFilledInput-root": {
              borderRadius: "8px",
              "&:before, &:after": {
                borderBottom: "none",
              },
            },
            
          }}
        />
      )}
    />
  );
};

export default PointField;
