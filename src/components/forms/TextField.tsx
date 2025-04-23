"use client";
import { SxProps, TextField } from "@mui/material";
import { Controller, RegisterOptions } from "react-hook-form";

interface TextFieldProps {
  control: any;
  label?: string;
  placeholder?: string;
  name: string;
  type?: string;
  rules?: RegisterOptions;
  valueovr?: string;
  readOnly?: boolean;
  onChangeOvr?: (param: string) => void;
  toUpperCase?: boolean;
  toLowerCase?: boolean;
  numericInput?: boolean;
  multiline?: boolean;
  rows?: number | undefined;
  disabled?: boolean;
  endAdornment?: string | undefined;
  noMargin?: boolean;
  minRows?: number;
  textAlign?: "left" | "center" | "right";
  size?: "small" | "medium";
  inputRef?: React.RefObject<HTMLInputElement> | ((instance: HTMLInputElement | null) => void);
  sx?: SxProps;
}

const TextFieldCtrl = ({
  control,
  label,
  name,
  type,
  rules,
  valueovr,
  readOnly,
  onChangeOvr,
  toUpperCase,
  toLowerCase,
  numericInput,
  multiline,
  rows,
  disabled,
  endAdornment,
  noMargin,
  minRows,
  textAlign,
  placeholder,
  size,
  inputRef,
  sx,
}: TextFieldProps) => {
  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={valueovr}
        render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
          <TextField
            id={name}
            autoComplete="on"
            helperText={error ? error.message : null}
            error={!!error}
            onChange={e => {
              if (toUpperCase) {
                onChange(e.target.value.toUpperCase());
              } else if (toLowerCase) {
                onChange(e.target.value.toLowerCase());
              } else {
                onChange(e);
              }
            }}
            onBlur={e => {
              if (onChangeOvr !== undefined) {
                onChangeOvr(e.target.value);
              }
            }}
            inputRef={node => {
              ref(node);
              if (inputRef) {
                if (typeof inputRef === "function") {
                  inputRef(node);
                } else {
                  if (inputRef && "current" in inputRef) {
                    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
                  }
                }
              }
            }}
            value={value}
            label={label}
            type={type}
            placeholder={placeholder}
            variant="outlined"
            multiline={multiline}
            rows={rows}
            minRows={minRows}
            disabled={disabled}
            slotProps={{
              input: {
                readOnly: readOnly,
                inputMode: numericInput ? "numeric" : "text",
                endAdornment: endAdornment,
              },
              htmlInput: {
                style: { textAlign: textAlign },
              },
            }}
            sx={{ mb: noMargin ? 0 : 2, ...sx }}
            size={size}
            aria-readonly={readOnly}
            fullWidth
          />
        )}
      />
    </>
  );
};

export default TextFieldCtrl;
