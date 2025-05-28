import parse from "html-react-parser";
import { Card, Box, Typography } from "@mui/material";
import { useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";

export default function CardDataIntroReport({
  richtext,
  index,
  style,
  setRowHeights,
}: {
  richtext: string;
  index: number;
  style: any;
  setRowHeights: (index: any, size: any) => void;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { setValue, getValues } = useFormContext();

  useEffect(() => {
    if (cardRef.current) {
      setRowHeights(index, cardRef.current?.clientHeight);
    }
  }, [cardRef]);

  return (
    <div style={style}>
      <Card ref={cardRef} component="div">
        <Box sx={{ display: "flex", p: 3 }}>
          <Typography
            component="button"
            onClick={() => {
              if (getValues("content") == richtext) {
                return;
              }
              setValue("content", richtext);
              setValue("guide_hist_clicked", true);
            }}
          >
            {parse(richtext)}
          </Typography>
        </Box>
      </Card>
    </div>
  );
}
