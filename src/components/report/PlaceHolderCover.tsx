import { Paper, Box, Skeleton } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import useAPI from "@/hooks/useAPI";
import { AxiosResponse } from "axios";

const PlaceHolderCover = ({
  id_image,
  is_selected,
}: {
  id_image: string;
  is_selected: boolean;
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const api = useAPI();

  useEffect(() => {
    if (!id_image) return;

    let blobUrl: string;

    (async () => {
      setLoading(true);
      try {
        const { data }: AxiosResponse<Blob> = await api.get(`/report/cover/${id_image}`, {
          responseType: "blob",
        });

        blobUrl = URL.createObjectURL(data);

        const img = new Image();
        img.src = blobUrl;

        img.onload = () => {
          setImageUrl(blobUrl);
          setLoading(false);
        };

        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          setLoading(false);
        };
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    })();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id_image]);

  return (
    <Paper elevation={is_selected ? 3 : 0} sx={{ m: 2, width: "fit-content" }}>
      <Box
        sx={theme => ({
          p: 4,
          backgroundColor: is_selected ? theme.palette.grey[800] : theme.palette.grey[300],
          width: "fit-content",
        })}
      >
        {loading || !imageUrl ? (
          <Skeleton variant="rectangular" height={200} width={150} />
        ) : (
          <img ref={imageRef} src={imageUrl} height={200} alt="Report Cover" />
        )}
      </Box>
    </Paper>
  );
};

export default PlaceHolderCover;
