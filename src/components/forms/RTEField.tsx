import { Box, SxProps } from "@mui/material";
import { Controller, RegisterOptions } from "react-hook-form";
import ReactQuill, { ReactQuillProps } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "@/override-rte.scss";

interface RTEProps extends ReactQuillProps {
  control: any;
  name: string;
  rules?: RegisterOptions;
  placeholder?: string;
  sx?: SxProps;
  label?: string;
  disabled?: boolean;
}

const RTEField = ({
  control,
  name,
  rules,
  placeholder = "Write Description",
  label,
  sx,
  disabled,
  ...rest
}: RTEProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Box sx={sx}>
          {label && <p>{label}</p>}
          <ReactQuill
            {...rest}
            style={{ height: "auto" }}
            value={field.value}
            onChange={(text: string) => {
              field.onChange(text);
            }}
            placeholder={placeholder}
            readOnly={disabled}
            modules={{
              toolbar: [
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ header: [1, 2, 3, false] }],
              ],
            }}
          />
        </Box>
      )}
    />
  );
};

export default RTEField;
