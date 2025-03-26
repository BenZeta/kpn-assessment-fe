import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Image } from "@mui/icons-material";
import { Box } from "@mui/material";

interface ImageContInterface<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export default function ImageCont<T extends FieldValues>({ control, name }: ImageContInterface<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        return (
          <>
            {value ? (
              <Box>
                <img
                  src={`${import.meta.env.VITE_API_URL}/static/question/${value}`}
                  style={{ width: "10rem" }}
                />
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", backgroundColor: "#f5f5f5" }}>
                <Image sx={{ fontSize: 40 }} />
                <Box sx={{ ml: 2 }}>No Image</Box>
              </Box>
            )}
          </>
        );
      }}
    />
  );
}
