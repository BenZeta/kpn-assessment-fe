import { Button, IconButton, MenuItem, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
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
import {CategoryValue} from "@/types/MasterData";
import { isAxiosError } from "axios";
import useAPI from "@/hooks/useAPI";
import {MaterialReactTable, MRT_ColumnDef, useMaterialReactTable} from "material-react-table";
import moment from "moment";
import SelectCtrl from "@/components/forms/Select";

const Category = () => {
    const API = useAPI();
    const getPermission = useAuthStore((state) => state.getPermission);
    const { showLoading, hideLoading } = useLoading();
    const { data: category, refetch } = useFetch<any>("/category");
    const { data: criteriaData } = useFetch<any>("/criteria"); 
    const [selectedCategory, setSelectedCategory] = useState({ id: "", category_name: "" });
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
            category_name: "",
            category_code: "",
            criteria_id: "",
            is_active: true,
        } as CategoryValue,
    });

    const columns: MRT_ColumnDef<any>[] = useMemo(
      () => [
        {
          header: "Category Name",
          accessorKey: "category_name",
          muiTableHeadCellProps: { align: "center" },
          muiTableBodyCellProps: { align: "center" },
        },
        {
          header: "Category Code",
          accessorKey: "category_code",
          muiTableHeadCellProps: { align: "center" },
          muiTableBodyCellProps: { align: "center" },
        },
        {
          header: "Status",
          accessorKey: "is_active",
          muiTableHeadCellProps: { align: "center" },
          muiTableBodyCellProps: { align: "center" },
          Cell: ({ cell }: any) => (cell.getValue() ? "Active" : "Inactive"),
        },
        {
          header: "Created By",
          accessorKey: "created_by",
          muiTableHeadCellProps: { align: "center" },
          muiTableBodyCellProps: { align: "center" },
        },
        {
          header: "Created At",
          accessorKey: "created_at",
          muiTableHeadCellProps: { align: "center" },
          muiTableBodyCellProps: { align: "center" },
          Cell: ({ cell }) => {
            const value = cell.getValue();
            return value ? moment(value).format("MMMM DD, YYYY hh:mm A") : "";
          },
        },
        {
          header: "Action",
          accessorKey: "actions",
          enableSorting: false,
          enableColumnFilter: false,
          muiTableHeadCellProps: { align: "center" },
          muiTableBodyCellProps: { align: "center" },
          Cell: ({ row }) => {
            const id = row.original.id;
            const category_name = row.original.grouptest_name;

            return (
              <>
                {getPermission("fupdate", 11) && (
                  <IconButton
                    onClick={() => handleOpenForm(row.original, id)}
                    aria-label="edit"
                    size="small"
                    edge="end"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {getPermission("fdelete", 11) && (
                  <IconButton
                    onClick={() => handleOpenDelete(id, category_name)}
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

    const table = useMaterialReactTable({
        columns,
        data: category?.data ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableColumnFilters: true,
        enableSorting: true,
        enableRowSelection: false,
        enableRowActions: false,
    });

    const handleCloseForm = () => {
        reset();
        closeForm();
    };

    const handleOpenDelete= (id: string, category_name: string) => {
        setSelectedCategory({ id, category_name });
        openDelete();
    };

    const handleDelete = async (id: string) => {
        showLoading();
        try {
            const res = await API.delete(`/category/${id}`);
            console.log(res);
            refetch();
            snack.success("Category deleted successfully");
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

    const handleOpenForm = (data?: CategoryValue, id?: string)=> {
        if(data && id) {
            setIsEdit(true);
            setSelectedCategory({ id: id, category_name: data.category_name});
            reset(
                {
                    category_name: data.category_name,
                    category_code: data.category_code,
                    is_active: data.is_active,
                    criteria_id: data.criteria_id,
                },
                { keepDefaultValues: true, keepDirty: true }
            );
        } else {
            setIsEdit(false);
            reset({
                category_name: "",
                category_code: "",
                is_active: true,
                criteria_id: "",
            });
        }
        openForm();
    };

    const onCreate = async (values: CategoryValue) => {
        console.log("test", values);
        showLoading();
        try {
            const res = await API.post(`/category`, values);
            console.log(res);
            refetch();
            snack.success("Category created successfully");
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

    const onEdit = async (values: CategoryValue) => {
        console.log(values);
        showLoading();
        try {
            const { category_code, ...editValues } = values;
            const res = await API.patch(`/category/${selectedCategory.id}`, editValues);
            console.log(res);
            refetch();
            snack.success("Category updated successfully");
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
                Category
                {getPermission("fcreate", 11) && (
                    <Button
                        startIcon={<AddIcon />}
                        variant="outlined"
                        onClick={() => handleOpenForm()}
                        sx={{ ml: 2 }}
                    >
                        Create Category
                    </Button>
                )}
            </Typography>
            {category ? (
                getPermission("fread", 11) && <MaterialReactTable table={table} />
            ) : (
                <TableSkeleton column={4} row={2} small />
            )}

            <DialogComp
                title="Delete Category"
                open={isOpenDelete}
                onClose={closeDelete}
                actions={
                    <>
                        <Button onClick={closeDelete} variant="outlined" color="error">
                            Cancel
                        </Button>
                        <Button onClick={() => handleDelete(selectedCategory.id)} variant="contained" color="error">
                            Delete
                        </Button>
                    </>
                }
            >
                <Typography>{`Are you sure you want to delete ${selectedCategory.category_name}?`}</Typography>
            </DialogComp>

            <DialogComp
                title={!isEdit ? "Create Category" : "Edit Category"}
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
                    label="Category Name"
                    name="category_name"
                    rules={{ required: "Field required" }}
                />
                <TextFieldCtrl
                    control={control}
                    label="Category Code"
                    name="category_code"
                    rules={{
                        required: "Field required",
                        validate: value => !isEdit || !!value // Validasi khusus untuk edit
                    }}
                    disabled={isEdit}
                />
                <SelectCtrl control={control} name="criteria_id" label="Criteria" rules={{ required: "Field required" }}>
                    {criteriaData?.data.map((item: any) => (
                        <MenuItem key={item.value_id} value={item.value_id}>
                            {item.value_name}
                        </MenuItem>
                    ))}
                </SelectCtrl>
                <CheckboxCtrl name="is_active" control={control} label="Active" />
            </DialogComp>
        </>
    );
};
export default Category;

