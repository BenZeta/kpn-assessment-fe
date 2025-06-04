import { Controller, RegisterOptions } from "react-hook-form";
import ReactQuill, { ReactQuillProps } from "react-quill";
import "react-quill/dist/quill.snow.css";

interface RTEProps extends ReactQuillProps {
  control: any;
  name: string;
  rules?: RegisterOptions;
  placeholder?: string;
}

const RTEField = ({
  control,
  name,
  rules,
  placeholder = "Write Description",
  ...rest
}: RTEProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <ReactQuill
          {...rest}
          value={field.value} 
          onChange={(text: string) => {
            field.onChange(text);
          }}
          placeholder={placeholder}
        />
      )}
    />
  );
};

export default RTEField;
