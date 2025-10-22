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
  valueIsNumericString?: boolean;
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
  valueIsNumericString,
}: NumericProps) {
  return (
    <>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
          <FormControl sx={{ mb: noMargin ? 0 : 2 }}>
            <NumericFormat
              onChange={e => {
                // Convert the string value to a number before passing to the form
                const numericValue = e.target.value === "" ? "" : e.target.value;

                if (onChangeOvr !== undefined) {
                  onChangeOvr(e.target.value);
                }
                onChange(numericValue);
              }}
              value={value === "" ? "" : value}
              size={size}
              sx={sx}
              label={label}
              inputRef={ref}
              customInput={TextField}
              error={!!error}
              fullWidth
              allowNegative={allowNegative}
              decimalScale={decimalScale}
              allowLeadingZeros={allowLeadingZeros}
              valueIsNumericString={valueIsNumericString ?? false}
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
              onValueChange={values => {
                const { floatValue } = values;

                const finalValue = values.value === "" ? "" : floatValue;
                onChange(finalValue);
              }}
            />
            <HelperText message={error?.message} />
          </FormControl>
        )}
      />
    </>
  );
}
