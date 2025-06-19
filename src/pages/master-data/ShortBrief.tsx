import TextFieldCtrl from "@/components/forms/TextField";
import RTEField from "@/components/forms/RTEField";
import { BoxSkeleton } from "@/components/Skeleton";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { BriefValues } from "@/types/MasterData";
import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const ShortBrief = () => {
  const API = useAPI();
  const user_id = useAuthStore(state => state.user_id);
  const getPermission = useAuthStore(state => state.getPermission);
  const { data: brief, refetch } = useFetch<any>("/short-brief");
  const { showLoading, hideLoading } = useLoading();
  const {
    control,
    formState: { dirtyFields },
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      short_brief_name: "",
      updated_by: user_id,
    } as BriefValues,
  });

  useEffect(() => {
    if (brief) {
      reset({
        short_brief_name: brief.data.short_brief_name,
        updated_by: user_id,
      });
    }
  }, [brief]);

  const onUpdate = async (values: BriefValues) => {
    console.log(values);
    showLoading();
    try {
      const res = await API.patch(`/short-brief`, values);
      console.log(res);
      refetch();
      snack.success(`${res.data.message}`);
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data.message);
        console.error(error.response);
      } else {
        snack.error("Error, check log for details");
        console.error(error);
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Typography variant="h1" color="primary">
        Short Brief
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          {getPermission("fread", 3) && brief ? (
            <>
              <RTEField
                sx={{ minHeight: "20rem" }}
                name="short_brief_name"
                label="Brief"
                control={control}
                readOnly={!getPermission("fupdate", 3)}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography color="text.secondary">
                  Last update: {brief && brief.data.updated_date}
                </Typography>
                {getPermission("fupdate", 3) && (
                  <Button
                    variant="contained"
                    disabled={!dirtyFields.short_brief_name}
                    onClick={handleSubmit(onUpdate)}
                  >
                    Update
                  </Button>
                )}
              </Box>
            </>
          ) : (
            <BoxSkeleton />
          )}
        </Grid>
      </Grid>
    </>
  );
};
export default ShortBrief;
