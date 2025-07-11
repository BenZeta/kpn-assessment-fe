import { Control, Controller, FieldValues, Path } from "react-hook-form";
import PlaceHolderCover from "./PlaceHolderCover";
import { Box, Typography } from "@mui/material";

interface CardCoverFieldInterface<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
}

export default function CardCoverField<T extends FieldValues>({
  name,
  control,
}: CardCoverFieldInterface<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => {
        return value ? (
          <PlaceHolderCover id_image={value} />
        ) : (
          <Box sx={theme => ({
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "center",
          })}>
            <Typography variant="body2" color="textSecondary">
              No cover selected
            </Typography>
            <PlaceHolderCover id_image="" />  
          </Box>
        );
      }}
    />
  );
}
