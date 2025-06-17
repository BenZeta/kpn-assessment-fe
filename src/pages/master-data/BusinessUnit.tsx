import { Button, IconButton, Typography } from "@mui/material";
import StandardTable from "../../components/StandardTable";
import { useMemo, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { TableSkeleton } from "../../components/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useDialog from "../../hooks/useDialog";
import { snack } from "../../providers/SnackbarProvider";
import { useLoading } from "../../providers/LoadingProvider";
import DialogComp from "@/components/Dialog";
import { useForm } from "react-hook-form";
import TextFieldCtrl from "@/components/forms/TextField";
import CheckboxCtrl from "@/components/forms/Checkbox";
import AddIcon from "@mui/icons-material/Add";
import useAuthStore from "@/hooks/useAuthStore";
import { BUValues } from "@/types/MasterData";
import { isAxiosError } from "axios";
import useAPI from "@/hooks/useAPI";

const BusinessUnit = () => {
  const API = useAPI();
  const user_id = useAuthStore(state => state.user_id);
  const getPermission = useAuthStore(state => state.getPermission);
  const { showLoading, hideLoading } = useLoading();
  const { data: bu, refetch } = useFetch<any>("/bu");
  const [selectedBU, setSelectedBU] = useState({ id: "", bu_name: "" });
  const [isEdit, setIsEdit] = useState(false);
  const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();
  const { isOpen: isOpenForm, open: openForm, close: closeForm } = useDialog();
  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      bu_name: "",
      bu_code: "",
      is_active: true,
      created_by: user_id,
    } as BUValues,
  });

  const columns: any = useMemo(
    () => [
      {
        header: "BU Code",
        accessorKey: "bu_code",
        cell: (props: any) => props.getValue(),
      },
      {
        header: "BU Name",
        accessorKey: "bu_name",
        cell: (props: any) => props.getValue(),
      },
      {
        header: "Active",
        accessorKey: "is_active",
        cell: (props: any) => props.getValue().toString(),
      },
      {
        header: "Action",
        accessorKey: "id",
        meta: { align: "right" },
        cell: (props: any) => {
          const id = props.getValue();
          const bu_name = props.row.original.bu_name;

          return (
            <>
              {getPermission("fupdate", 1) && (
                <IconButton
                  onClick={() => handleOpenForm(props.row.original, id)}
                  aria-label="edit"
                  size="small"
                  edge="end"
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
              )}
              {getPermission("fdelete", 1) && (
                <IconButton
                  onClick={() => handleOpenDelete(id, bu_name)}
                  aria-label="delete"
                  color="error"
                  size="small"
                  edge="end"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </>
          );
        },
      },
    ],
    []
  );

  const handleCloseForm = () => {
    reset();
    closeForm();
  };

  const handleOpenDelete = (id: string, bu_name: string) => {
    setSelectedBU({ id, bu_name });
    openDelete();
  };

  const handleDelete = async (id: string) => {
    showLoading();
    try {
      await API.delete(`/bu/${id}`);
      refetch();
      snack.success("Business Unit deleted successfully");
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
      closeDelete();
      hideLoading();
    }
  };

  const handleOpenForm = (data?: BUValues, id?: string) => {
    if (data && id) {
      setIsEdit(true);
      setSelectedBU({ id: id, bu_name: data.bu_name });
      reset(
        {
          bu_name: data.bu_name,
          bu_code: data.bu_code,
          is_active: data.is_active,
        },
        { keepDefaultValues: true, keepDirty: true }
      );
    } else {
      setIsEdit(false);
    }
    openForm();
  };

  const onCreate = async (values: BUValues) => {
    console.log("test", values);
    showLoading();
    try {
      const res = await API.post(`/bu`, values);
      console.log(res);
      refetch();
      snack.success("Business Unit created successfully");
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
      handleCloseForm();
      hideLoading();
    }
  };

  const onEdit = async (values: BUValues) => {
    console.log(values);
    showLoading();
    try {
      const res = await API.patch(`/bu/${selectedBU.id}`, values);
      console.log(res);
      refetch();
      snack.success("Business Unit updated successfully");
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
      handleCloseForm();
      hideLoading();
    }
  };

  return (
    <>
      <Typography variant="h1" color="primary">
        Business Unit
        {getPermission("fcreate", 1) && (
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => handleOpenForm()}
            sx={{ ml: 2 }}
          >
            Create BU
          </Button>
        )}
      </Typography>
      {bu ? (
        getPermission("fread", 1) && <StandardTable columns={columns} data={bu?.data} />
      ) : (
        <TableSkeleton column={4} row={2} small />
      )}

      <DialogComp
        title="Delete Business Unit"
        open={isOpenDelete}
        onClose={closeDelete}
        actions={
          <>
            <Button onClick={closeDelete} variant="outlined" color="error">
              Cancel
            </Button>
            <Button onClick={() => handleDelete(selectedBU.id)} variant="contained" color="error">
              Delete
            </Button>
          </>
        }
      >
        <Typography>{`Are you sure you want to delete ${selectedBU.bu_name}?`}</Typography>
      </DialogComp>

      <DialogComp
        title={!isEdit ? "Create Business Unit" : "Edit Business Unit"}
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
        <TextFieldCtrl
          control={control}
          label="BU Name"
          name="bu_name"
          rules={{
            required: "Field required",
            maxLength: { value: 100, message: "Max 100 characters allowed" },
          }}
        />
        <TextFieldCtrl
          control={control}
          label="BU Code"
          name="bu_code"
          rules={{
            required: "Field required",
            maxLength: { value: 5, message: "Max 5 characters allowed" },
          }}
        />
        <CheckboxCtrl name="is_active" control={control} label="Active" />
      </DialogComp>
    </>
  );
};
export default BusinessUnit;
