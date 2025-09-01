"use client";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
  SxProps,
} from "@mui/material";
import { Controller, RegisterOptions } from "react-hook-form";
import { useState } from "react";

interface PasswordProps {
  control: any;
  label: string;
  name: string;
  rules?: RegisterOptions;
  sx?: SxProps;
}

export const PasswordWithEye = ({ control, label, name, rules, sx }: PasswordProps) => {
  const [showPassword, setPwd] = useState(false);

  const handleClickShowPassword = () => setPwd(show => !show);

  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormControl fullWidth variant="outlined" sx={sx}>
            <InputLabel htmlFor="outlined-adornment-password" error={!!error}>
              {label}
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              onChange={onChange}
              value={value}
              error={!!error}
              inputProps={{ autoComplete: "new-password" }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              }
              label={label}
            />
            {error && <FormHelperText error>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />
    </>
  );
};
