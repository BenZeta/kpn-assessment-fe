import RTEField from "@/components/forms/RTEField";
import TextFieldCtrl from "@/components/forms/TextField";
import { BoxSkeleton } from "@/components/Skeleton";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { TermsPPValues } from "@/types/MasterData";
import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const TermsPP = () => {
  const API = useAPI();
  const user_id = useAuthStore(state => state.user_id);
  const getPermission = useAuthStore(state => state.getPermission);
  const { data: termsPP, refetch } = useFetch<any>("/terms-pp");
  const { showLoading, hideLoading } = useLoading();
  const {
    control,
    reset,
    formState: { dirtyFields },
    handleSubmit,
  } = useForm({
    defaultValues: {
      terms: "",
      pp: "",
      updated_by: user_id,
    } as TermsPPValues,
  });

  useEffect(() => {
    if (termsPP) {
      const terms = termsPP.data.terms;
      const pp = termsPP.data.pp;
      reset({
        terms: terms.name,
        pp: pp.name,
      });
    }
  }, [termsPP]);

  const onUpdateTerms = async (values: TermsPPValues) => {
    console.log(values);
    showLoading();
    try {
      const res = await API.patch(`/terms-pp/terms`, {
        name: values.terms,
        updated_by: user_id,
      });
      console.log(res);
      refetch();
      snack.success("Terms updated successfully");
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error("Something went wrong: " + data.message);
        console.error(error.response);
      } else {
        snack.error("Error, check log for details");
        console.error(error);
      }
    } finally {
      hideLoading();
    }
  };

  const onUpdatePP = async (values: TermsPPValues) => {
    console.log(values);
    showLoading();
    try {
      const res = await API.patch(`/terms-pp/pp`, {
        name: values.pp,
        updated_by: user_id,
      });
      console.log(res);
      refetch();
      snack.success("Privacy Policy updated successfully");
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error("Something went wrong: " + data.message);
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
        Terms & Privacy Policy
      </Typography>
      <Grid container spacing={4}>
        {getPermission("fread", 2) && (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              {termsPP ? (
                <>
                  <RTEField
                    name="terms"
                    label="Terms"
                    control={control}
                    readOnly={!getPermission("fupdate", 2)}
                    sx={{ mb: 1 }}
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography color="text.secondary">
                      Last update: {termsPP && termsPP.data.terms.updated_date}
                    </Typography>
                    {getPermission("fupdate", 2) && (
                      <Button
                        variant="contained"
                        disabled={!dirtyFields.terms}
                        onClick={handleSubmit(onUpdateTerms)}
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
            <Grid size={{ xs: 12, md: 6 }}>
              {termsPP ? (
                <>
                  <RTEField
                    name="pp"
                    label="Privacy Policy"
                    control={control}
                    readOnly={!getPermission("fupdate", 2)}
                    sx={{ mb: 1 }}
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography color="text.secondary">
                      Last update: {termsPP && termsPP.data.pp.updated_date}
                    </Typography>
                    {getPermission("fupdate", 2) && (
                      <Button
                        variant="contained"
                        disabled={!dirtyFields.pp}
                        onClick={handleSubmit(onUpdatePP)}
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
          </>
        )}
      </Grid>
    </>
  );
};
export default TermsPP;
