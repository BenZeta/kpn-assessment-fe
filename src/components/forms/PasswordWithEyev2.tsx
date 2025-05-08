import { Controller, Control, Path, FieldValues, RegisterOptions } from "react-hook-form";
import {
  TextField,
  InputAdornment,
  Box,
  Typography,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { useState } from "react";

interface PasswordWithEye<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  label: string;
}

export default function PasswordWithEyev2<T extends FieldValues>({
  control,
  name,
  label,
  rules,
}: PasswordWithEye<T>) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            {label}
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            value={value}
            placeholder="••••••••"
            onChange={onChange}
            variant="outlined"
            size="small"
            sx={{ bgcolor: "#fff" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => {
                      setShowPassword(prev => !prev);
                    }}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {!!error && (
            <FormHelperText
              sx={theme => ({
                color: error ? theme.palette.error.main : theme.palette.text.primary,
              })}
            >
              {error.message}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
}
