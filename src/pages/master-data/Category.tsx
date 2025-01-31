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
import {CategoryValue} from "@/types/MasterData";
import { isAxiosError } from "axios";
import useAPI from "@/hooks/useAPI";
import {formatDateTime} from "@/utils/helper.ts";

export const Category = () => {
    const API = useAPI();
    const getPermission = useAuthStore((state) => state.getPermission);
    const { showLoading, hideLoading } = useLoading();
    const { data: category, refetch } = useFetch<any>("/category");
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
            is_active: true,
        } as CategoryValue,
    });

    const columns: any = useMemo(
        () => [
            {
                header: "Nama Kategori",
                accessorKey: "category_name",
                cell: (props: any) => props.getValue(),
            },
            {
                header: "Kode Kategori",
                accessorKey: "category_code",
                cell: (props: any) => props.getValue(),
            },
            {
                header: "Active",
                accessorKey: "is_active",
                cell: (props: any) => props.getValue().toString(),
            },
            {
                header: "Created By",
                accessorKey: "created_by",
                cell: (props: any) => props.getValue(),
            },
            {
                header: "Created At",
                accessorKey: "created_at",
                cell: (props: any) => {
                    const value = props.getValue();
                    return value ? formatDateTime(value) : '-';
                },
            },
            {
                header: "Action",
                accessorKey: "id",
                meta: { align: "right" },
                cell: (props: any) => {
                    const id = props.getValue();
                    const category_name = props.row.original.category_name;

                    return (
                        <>
                            {getPermission("fupdate", 11) && (
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
            snack.success(res.data?.message);
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

    const handleOpenForm = (data?: CategoryValue, id?: string)=> {
        if(data && id) {
            setIsEdit(true);
            setSelectedCategory({ id: id, category_name: data.category_name});
            reset(
                {
                    category_name: data.category_name,
                    category_code: data.category_code,
                    is_active: data.is_active,
                },
                { keepDefaultValues: true, keepDirty: true }
            );
        } else {
            setIsEdit(false);
            reset({
                category_name: "",
                category_code: "",
                is_active: true
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
            snack.success(`${res.data.message} ${res.data.category_code}`);
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

    const onEdit = async (values: CategoryValue) => {
        console.log(values);
        showLoading();
        try {
            const { category_code, ...editValues } = values;
            const res = await API.patch(`/category/${selectedCategory.id}`, editValues);
            console.log(res);
            refetch();
            snack.success(`${res.data.message} ${res.data.category_code}`);
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
                getPermission("fread", 11) && <StandardTable columns={columns} data={category?.data} />
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
                <CheckboxCtrl name="is_active" control={control} label="Active" />
            </DialogComp>
        </>
    );
};


