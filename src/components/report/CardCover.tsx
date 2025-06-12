import PlaceHolderCover from "./PlaceHolderCover";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useFormContext } from "react-hook-form";

const CardCover = ({
  id,
  index,
  style,
  setRowHeights,
}: {
  id: string;
  index: number;
  style: any;
  setRowHeights: (index: any, size: any) => void;
}) => {
  const { setValue } = useFormContext();
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (placeholderRef.current) {
      setRowHeights(index, placeholderRef.current?.clientWidth);
    }
  }, [placeholderRef]);
  return (
    <div style={style}>
      <Box
        component="button"
        ref={placeholderRef}
        onClick={() => {
          setValue("cover_id", id);
        }}
      >
        <PlaceHolderCover id_image={id} />
      </Box>
    </div>
  );
};

export default CardCover;
