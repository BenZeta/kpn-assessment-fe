import PlaceHolderCover from "./PlaceHolderCover";
import { useEffect, useRef, useState } from "react";
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
  const { setValue, getValues, watch } = useFormContext();
  const [selected, setSelected] = useState(false);

  const placeholderRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (placeholderRef.current) {
      setRowHeights(index, placeholderRef.current?.clientWidth);
    }
  }, [placeholderRef]);

  useEffect(() => {
    if (id == getValues("cover_id")) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, [watch("cover_id")]);
  return (
    <div style={style}>
      <Box
        component="button"
        ref={placeholderRef}
        onClick={() => {
          setValue("cover_id", id);
        }}
      >
        <PlaceHolderCover id_image={id} is_selected={selected} />
      </Box>
    </div>
  );
};

export default CardCover;
