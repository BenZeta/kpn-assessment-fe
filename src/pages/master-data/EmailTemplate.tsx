import {Box, Button, IconButton, Typography} from "@mui/material";
import { useMemo, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { TableSkeleton } from "../../components/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useDialog from "../../hooks/useDialog";
import { snack } from "../../providers/SnackbarProvider";
import { useLoading } from "../../providers/LoadingProvider";
import DialogComp from "@/components/Dialog";
import { useForm, Controller } from "react-hook-form";
import TextFieldCtrl from "@/components/forms/TextField";
import AddIcon from "@mui/icons-material/Add";
import useAuthStore from "@/hooks/useAuthStore";
import {EmailTemplateValues} from "@/types/MasterData";
import { isAxiosError } from "axios";
import useAPI from "@/hooks/useAPI";
import {MaterialReactTable, MRT_ColumnDef, useMaterialReactTable} from "material-react-table";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const EmailTemplate = () => {
    const API = useAPI();
    const getPermission = useAuthStore((state) => state.getPermission);
    const { showLoading, hideLoading } = useLoading();
    const { data: emailTemplate, refetch } = useFetch<any>("/email-template");
    const [selectedEmailTemplate, setSelectedEmailTemplate] = useState({ id: "", subject: "" });
    const [isEdit, setIsEdit] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();
    const { isOpen: isOpenForm, open: openForm, close: closeForm } = useDialog();
    const { isOpen: isOpenPreview, open: openPreview, close: closePreview } = useDialog();
    const {
        control,
        reset,
        handleSubmit,
        formState: { isDirty },
    } = useForm({
        defaultValues: {
            subject: "",
            title: "",
            header: "",
            footer: "",
        } as EmailTemplateValues,
    });

    // Quill editor modules/formats configuration
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const columns: MRT_ColumnDef<any>[] = useMemo(
        () => [
            {
                header: "Subject",
                accessorKey: "subject",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
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
            },
            {
                header: "Actions",
                accessorKey: "actions",
                enableSorting: false,
                enableColumnFilter: false,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
                Cell: ({ row }) => {
                    const id = row.original.id;
                    const subject = row.original.subject;
                    return (
                        <>
                            <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                <IconButton
                                    onClick={() => handleOpenPreview(id, subject)}
                                    aria-label="preview"
                                    size="small"
                                    edge="end"
                                    sx={{ mr: 1 }}
                                >
                                    <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleOpenForm(row.original, id)}
                                    aria-label="edit"
                                    size="small"
                                    edge="end"
                                    sx={{ mr: 1 }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleOpenDelete(id, subject)}
                                    aria-label="delete"
                                    color="error"
                                    size="small"
                                    edge="end"
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </Box>
                        </>
                    )
                }
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: emailTemplate?.data ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableColumnFilters: true,
        enableSorting: true,
        enableRowSelection: false,
        enableRowActions: false,
    })

    const handleCloseForm = () => {
        reset();
        closeForm();
    };

    const handleOpenDelete = (id: string, subject: string) => {
        setSelectedEmailTemplate({ id, subject });
        openDelete();
    };

    const handleOpenPreview = async (id: string, subject: string) => {
        setSelectedEmailTemplate({ id, subject });
        showLoading();
        try {
            const res = await API.get(`/email-template/${id}`);
            setPreviewData(res.data);
            openPreview();
        } catch (error) {
            if (isAxiosError(error)) {
                const data = error.response?.data;
                snack.error(data.message);
                console.error(error.response);
            } else {
                snack.error("Error loading preview");
                console.error(error);
            }
        } finally {
            hideLoading();
        }
    }

    const handleDelete = async (id: string) => {
        showLoading();
        try {
            const res = await API.delete(`/email-template/${id}`);
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

    const handleOpenForm = (data?: EmailTemplateValues, id?: string) => {
        if (data && id) {
            setIsEdit(true);
            setSelectedEmailTemplate({ id: id, subject: data.subject });
            reset(
                {
                    subject: data.subject,
                    title: data.title,
                    header: data.header,
                    footer: data.footer
                },
                { keepDefaultValues: true, keepDirty: true }
            );
        } else {
            setIsEdit(false);
        }
        openForm();
    };

    const onCreate = async (values: EmailTemplateValues) => {
        showLoading();
        try {
            const res = await API.post(`/email-template`, values);
            refetch();
            snack.success(`${res.data.message} ${res.data.subject}`);
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

    const onEdit = async (values: EmailTemplateValues) => {
        showLoading();
        try {
            const res = await API.patch(`/email-template/${selectedEmailTemplate.id}`, values);
            refetch();
            snack.success(`${res.data.message} ${res.data.subject}`);
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
                Email Template
                {getPermission("fcreate", 1) && (
                    <Button
                        startIcon={<AddIcon />}
                        variant="outlined"
                        onClick={() => handleOpenForm()}
                        sx={{ ml: 2 }}
                    >
                        Create Email Template
                    </Button>
                )}
            </Typography>
            {emailTemplate ? (
                getPermission("fread", 1) && <MaterialReactTable table={table}/>
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
                        <Button onClick={() => handleDelete(selectedEmailTemplate.id)} variant="contained" color="error">
                            Delete
                        </Button>
                    </>
                }
            >
                <Typography>{`Are you sure you want to delete ${selectedEmailTemplate
                    .subject}?`}</Typography>
            </DialogComp>

            <DialogComp
                title={!isEdit ? "Create Email Template" : "Edit Email Template"}
                open={isOpenForm}
                onClose={handleCloseForm}
                maxWidth="md"
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
                    label="Subject"
                    name="subject"
                    rules={{ required: "Fielcd required" }}
                />

                <Box sx={{ mb: 2, mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Title</Typography>
                    <Controller
                        name="title"
                        control={control}
                        rules={{ required: "Field required" }}
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <ReactQuill
                                    value={field.value}
                                    onChange={field.onChange}
                                    modules={quillModules}
                                    theme="snow"
                                    style={{ height: '150px', marginBottom: '30px' }}
                                />
                                {error && (
                                    <Typography color="error" variant="caption">
                                        {error.message}
                                    </Typography>
                                )}
                            </>
                        )}
                    />
                </Box>
                <Box sx={{ mb: 2, mt: 4 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Header</Typography>
                    <Controller
                        name="header"
                        control={control}
                        rules={{ required: "Field required" }}
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <ReactQuill
                                    value={field.value}
                                    onChange={field.onChange}
                                    modules={quillModules}
                                    theme="snow"
                                    style={{ height: '150px', marginBottom: '30px' }}
                                />
                                {error && (
                                    <Typography color="error" variant="caption">
                                        {error.message}
                                    </Typography>
                                )}
                            </>
                        )}
                    />
                </Box>
                <Box sx={{ mb: 2, mt: 4 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Footer</Typography>
                    <Controller
                        name="footer"
                        control={control}
                        rules={{ required: "Field required" }}
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <ReactQuill
                                    value={field.value}
                                    onChange={field.onChange}
                                    modules={quillModules}
                                    theme="snow"
                                    style={{ height: '150px', marginBottom: '30px' }}
                                />
                                {error && (
                                    <Typography color="error" variant="caption">
                                        {error.message}
                                    </Typography>
                                )}
                            </>
                        )}
                    />
                </Box>
            </DialogComp>

            <DialogComp
                title={"Email Template Preview"}
                open={isOpenPreview}
                onClose={closePreview}
                maxWidth="md"
            >
                {previewData ? (
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Subject: {previewData.data.subject}
                        </Typography>
                        <Box
                            sx={{
                                mt: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                height: '60vh',
                                overflow: 'auto'
                            }}
                        >
                            <iframe
                                srcDoc={previewData.data.template}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                                title="Email Template Preview"
                            />
                        </Box>
                    </Box>
                ) : (
                    <Typography>Loading preview...</Typography>
                )}
            </DialogComp>
        </>
    );
};