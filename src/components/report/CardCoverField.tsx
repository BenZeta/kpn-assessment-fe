import { Control, Controller, FieldValues, Path } from "react-hook-form";
import PlaceHolderCover from "./PlaceHolderCover";

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
        return <PlaceHolderCover id_image={value} />;
      }}
    />
  );
}
