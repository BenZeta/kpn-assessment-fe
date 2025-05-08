import { Controller, RegisterOptions } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { TextField, FormControl, FormHelperText, useTheme, SxProps } from "@mui/material";
import { useMemo } from "react";

interface NumericProps {
  name: string;
  label: string;
  control: any;
  rules?: RegisterOptions;
  readOnly?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  type?: string;
  onChangeOvr?: (param: string) => void;
  noMargin?: boolean;
  decimalScale?: number;
  allowNegative?: boolean;
  maxLength?: number;
  size?: "small" | "medium";
  sx?: SxProps;
  allowLeadingZeros?: boolean;
}

const HelperText = ({ message }: { message: string | undefined }) => {
  const theme = useTheme();
  const helperText = useMemo(() => {
    if (message !== undefined) {
      return message;
    }
    return "";
  }, [message]);
  return <FormHelperText sx={{ color: theme.palette.error.main }}>{helperText}</FormHelperText>;
};

export default function NumericFieldCtrl({
  name,
  label,
  control,
  rules,
  readOnly,
  disabled,
  min,
  max,
  type,
  onChangeOvr,
  noMargin,
  decimalScale,
  maxLength,
  allowNegative = false,
  size,
  sx,
  allowLeadingZeros,
}: NumericProps) {
  return (
    <>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
          <FormControl fullWidth sx={{ mb: noMargin ? 0 : 2 }}>
            <NumericFormat
              onChange={e => {
                if (onChangeOvr !== undefined) {
                  onChangeOvr(e.target.value);
                }
                onChange(e);
              }}
              size={size}
              sx={sx}
              value={value}
              label={label}
              inputRef={ref}
              customInput={TextField}
              error={!!error}
              fullWidth
              allowNegative={allowNegative}
              decimalScale={decimalScale}
              allowLeadingZeros={allowLeadingZeros}
              slotProps={{
                input: {
                  readOnly: readOnly,
                  disabled: disabled,
                  ...(type === "number" && {
                    type: "number",
                    min: min,
                    max: max,
                  }),
                },
                htmlInput: {
                  maxLength: maxLength,
                },
              }}
            />
            <HelperText message={error?.message} />
          </FormControl>
        )}
      />
    </>
  );
}
