import { Controller, FieldValues, Path, Control } from "react-hook-form";
import { Autocomplete, TextField } from "@mui/material";

interface AutoCompleteCompInterface<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: { value: string | number; label: string }[];
}

export default function AutoCompleteComp<T extends FieldValues>({
  control,
  name,
  label,
  options,
}: AutoCompleteCompInterface<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { ref, value, onChange } }) => {
        return (
          <Autocomplete
            value={options.find(option => option.value === value)}
            onChange={(e, value) => onChange(typeof value == "string" ? value : value?.value)}
            onInputChange={(_, data, reason) => {
              if (data) onChange(data);
              if (reason == "reset") {
                onChange("");
              }
            }}
            options={options}
            getOptionLabel={option => {
              return typeof option === "string" ? option : option.label;
            }}
            isOptionEqualToValue={(option, value) => {
              if (typeof value !== "string") return option.value == value.value;
              return value;
            }}
            renderInput={params => (
              <TextField {...params} inputRef={ref} label={label} variant="outlined" />
            )}
          />
        );
      }}
    />
  );
}
