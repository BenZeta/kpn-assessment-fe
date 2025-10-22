import { Control, Controller, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { Autocomplete, SxProps, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface AutoCompleteCompInterface<T extends FieldValues> {
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  label: string;
  control: Control<T>;
  options: Array<{
    value: string;
    label: string;
  }>;
  freeSolo?: boolean;
  multiple?: boolean;
  sx?: SxProps;
}

export default function AutoCompleteComp<T extends FieldValues>({
  name,
  rules,
  label,
  options,
  control,
  freeSolo,
  multiple,
  ...rest
}: AutoCompleteCompInterface<T>) {
  const theme = useTheme();
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { ref, value, ...field }, fieldState: { error, invalid } }) => {
        return (
          <>
            <Autocomplete
              {...field}
              value={value}
              multiple={multiple}
              freeSolo={freeSolo}
              options={options}
              getOptionLabel={option => (typeof option === "string" ? option : option.label)}
              renderInput={params => (
                <TextField
                  {...params}
                  {...rest}
                  label={label}
                  inputRef={ref}
                  error={invalid}
                  helperText={error?.message}
                />
              )}
              onChange={(e, value) => field.onChange(value)}
              onInputChange={(_, data, reason) => {
                if (data) field.onChange(data);
                if (reason == "reset") {
                  field.onChange("");
                }
              }}
              isOptionEqualToValue={(option, value) => option.value == value.value}
            />
          </>
        );
      }}
    />
  );
}
