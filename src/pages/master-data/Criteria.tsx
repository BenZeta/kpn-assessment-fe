import useFetch from "@/hooks/useFetch";
import {
  Box,
  Typography,
  Grid2 as Grid,
  Card,
  CardContent,
  TextField,
  CardActions,
  Button,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import useDialog from "@/hooks/useDialog";
import { useFieldArray, useForm } from "react-hook-form";
import { snack } from "@/providers/SnackbarProvider";
import DialogComp from "@/components/Dialog";
import TextFieldCtrl from "@/components/forms/TextField";
import { useLoading } from "@/providers/LoadingProvider";
import { useState } from "react";
import NumericFieldCtrl from "@/components/forms/NumericField";
import { BoxSkeleton } from "@/components/Skeleton";
import { CategoryValues, CriteriaType } from "@/types/MasterData";
import useAuthStore from "@/hooks/useAuthStore";
import { isAxiosError } from "axios";
import useAPI from "@/hooks/useAPI";

const Criteria = () => {
  const API = useAPI();
  const user_id = useAuthStore(state => state.user_id);
  const getPermission = useAuthStore(state => state.getPermission);
  const { showLoading, hideLoading } = useLoading();
  const { data: criteria, refetch } = useFetch<any>("/criteria");
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState({ id: "", name: "" });
  const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();
  const { isOpen: isOpenForm, open: openForm, close: closeForm } = useDialog();
  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty },
    getValues,
    watch,
  } = useForm({
    defaultValues: {
      value_code: "",
      value_name: "",
      created_by: user_id,
      criteria: [
        {
          criteria_name: "",
          description: "",
          minimum_score: 0,
          maximum_score: 10,
          is_active: true,
        },
      ],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    name: "criteria",
    control: control,
  });

  const handleCloseForm = () => {
    reset();
    closeForm();
  };

  const handleOpenForm = (data?: CategoryValues, id?: string) => {
    if (data && id) {
      setIsEdit(true);
      setSelected({ id: id, name: data.value_name });
      reset(
        {
          value_code: data.value_code,
          value_name: data.value_name,
          // user_id: data.user_id,
          criteria: data.criteria,
        },
        { keepDefaultValues: true, keepDirty: true }
      );
    } else {
      setIsEdit(false);
    }
    openForm();
  };

  const handleOpenDelete = (id: string, name: string) => {
    setSelected({ id, name });
    openDelete();
  };

  const handleDelete = async (id: string) => {
    console.log(selected);
    showLoading();
    try {
      const res = await API.delete(`/criteria/${id}`);
      console.log(res);
      refetch();
      snack.success(`${res.data.message}: ${res.data.name}`);
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
      closeDelete();
      hideLoading();
    }
  };

  const onCreate = async (values: CategoryValues) => {
    console.log("test", values);
    showLoading();
    try {
      const res = await API.post(`/criteria`, values);
      console.log(res);
      refetch();
      snack.success(`${res.data.message} ${res.data.category_name}`);
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
      handleCloseForm();
      hideLoading();
    }
  };

  const onEdit = async (values: CategoryValues) => {
    console.log(values);
    showLoading();
    try {
      const res = await API.patch(`/criteria/${selected.id}`, { ...values, user_id: user_id });
      console.log(res);
      refetch();
      snack.success(`${res.data.message} ${res.data.value_name}`);
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
      handleCloseForm();
      hideLoading();
    }
  };

  return (
    <>
      <Typography variant="h1" color="primary">
        Criteria
        {getPermission("fcreate", 5) && (
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => handleOpenForm()}
            sx={{ ml: 2 }}
          >
            Create Criteria
          </Button>
        )}
      </Typography>
      {getPermission("fread", 5) && criteria ? (
        <>
          <Grid container spacing={2}>
            {criteria.data.map((category: any, index: number) => (
              <Grid size={{ xs: 12, lg: 6 }} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                      {`${category.value_name} (${category.value_code})`}
                    </Typography>
                    {category.criteria.map((criteria: CriteriaType, index: number) => (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mb: index === category.criteria.length - 1 ? 0 : 2,
                        }}
                        key={index}
                      >
                        <TextField
                          label="Criteria"
                          value={criteria.criteria_name}
                          fullWidth
                          slotProps={{ input: { readOnly: true } }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <TextField
                            label="Minimum Score"
                            value={criteria.minimum_score}
                            fullWidth
                            slotProps={{ input: { readOnly: true } }}
                          />
                          <TextField
                            label="Maximum Score"
                            value={criteria.maximum_score}
                            fullWidth
                            slotProps={{ input: { readOnly: true } }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                  <CardActions>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "end", width: "100%" }}>
                      {getPermission("fupdate", 5) && (
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenForm(category, category.value_id)}
                        >
                          Edit
                        </Button>
                      )}
                      {getPermission("fdelete", 5) && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleOpenDelete(category.value_id, category.value_name)}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <BoxSkeleton />
      )}

      <DialogComp
        maxWidth="md"
        title={!isEdit ? "Create Criteria" : "Edit Criteria"}
        open={isOpenForm}
        onClose={handleCloseForm}
        actions={
          <>
            <Button onClick={handleCloseForm} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={!isEdit ? handleSubmit(onCreate) : handleSubmit(onEdit)}
              variant="contained"
              disabled={!isDirty}
            >
              {!isEdit ? "Create" : "Edit"}
            </Button>
          </>
        }
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextFieldCtrl
            control={control}
            label="Category Name"
            name="value_name"
            rules={{ required: "Field required" }}
          />
          <TextFieldCtrl
            control={control}
            label="Category Code"
            name="value_code"
            rules={{ required: "Field required" }}
          />
        </Box>
        {fields.map((field, index) => (
          <Grid container spacing={1} key={field.id}>
            <Grid size={{ md: 12 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", my: 2 }} key={field.id}>
                <TextFieldCtrl
                  control={control}
                  label="Criteria Name"
                  name={`criteria.${index}.criteria_name`}
                  rules={{ required: "Field required" }}
                  noMargin
                />
                <NumericFieldCtrl
                  control={control}
                  label="Minimum Score"
                  name={`criteria.${index}.minimum_score`}
                  rules={{
                    required: "Field required",
                    validate: {
                      minValue: values =>
                        index > 0
                          ? Number(values) ===
                              Number(watch(`criteria.${index - 1}.maximum_score`)) + 1 ||
                            "Must +1 from prev max"
                          : true,
                    },
                  }}
                  decimalScale={0}
                  noMargin
                  min={0}
                />
                <NumericFieldCtrl
                  control={control}
                  label="Maximum Score"
                  name={`criteria.${index}.maximum_score`}
                  rules={{
                    required: "Field required",
                    validate: {
                      minValue: values =>
                        Number(values) >= Number(watch(`criteria.${index}.minimum_score`)) ||
                        "Must >= min",
                    },
                  }}
                  decimalScale={0}
                  noMargin
                  min={0}
                />

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <IconButton color="error" disabled={index === 0} onClick={() => remove(index)}>
                    <RemoveIcon />
                  </IconButton>
                  <IconButton
                    disabled={index !== fields.length - 1}
                    color="success"
                    onClick={() =>
                      append({
                        criteria_name: "",
                        description: "",
                        minimum_score: Number(getValues(`criteria.${index}.maximum_score`)) + 1,
                        maximum_score: Number(getValues(`criteria.${index}.maximum_score`)) + 11,
                        is_active: true,
                      })
                    }
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
              <Grid size={{ md: 10.5 }}>
                <TextFieldCtrl
                  control={control}
                  label="Description"
                  name={`criteria.${index}.description`}
                  multiline
                  rows={2}
                  rules={{ required: "Field required" }}
                />
              </Grid>
            </Grid>
          </Grid>
        ))}
      </DialogComp>

      <DialogComp
        title="Delete Criteria"
        open={isOpenDelete}
        onClose={closeDelete}
        actions={
          <>
            <Button onClick={closeDelete} variant="outlined" color="error">
              Cancel
            </Button>
            <Button onClick={() => handleDelete(selected.id)} variant="contained" color="error">
              Delete
            </Button>
          </>
        }
      >
        <Typography>{`Are you sure you want to delete ${selected.name}?`}</Typography>
      </DialogComp>
    </>
  );
};
export default Criteria;
