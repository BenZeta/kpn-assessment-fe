import { Button, Typography, Box, IconButton } from "@mui/material";
import {useEffect, useMemo, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {MaterialReactTable, MRT_ColumnDef, useMaterialReactTable} from "material-react-table";
import useFetch from "@/hooks/useFetch";
import useAPI from "@/hooks/useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { useLoading } from "@/providers/LoadingProvider";
import DialogComp from "@/components/Dialog";
import TextFieldCtrl from "@/components/forms/TextField";
import useDialog from "@/hooks/useDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckboxCtrl from "@/components/forms/Checkbox.tsx";
import InfoIcon from "@mui/icons-material/Info";
import {isAxiosError} from "axios";
import {TestDetail} from "@/types/MasterData.ts";

const TestCreateEdit = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const API = useAPI();
    const { showLoading, hideLoading } = useLoading();
    const { isOpen, open, close } = useDialog();
    const navigate = useNavigate();
    const { data: test, refetch: refetchTest } = useFetch<TestDetail>(isEdit ? `/test/${id}` : null);
    const { data: availableSubtest, refetch: refetchAvailableSubtest } = useFetch<{ data: any[] }>(isEdit ? `/test/${id}/subtest-available` : null);
    const { data: allSubtest } = useFetch<{ data: any[] }>(!isEdit ? `/subtest` : null);
    const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();
    const [selectedRows, setSelectedRows] = useState({});
    const [selectedTest, setSelectedTest] = useState<{ id: string; subtest_name: string } | null>(null);


    const {
        control,
        handleSubmit,
        trigger,
        reset
    } = useForm({
        defaultValues: {
            test_name: "",
            test_code: "",
            is_active: true,
            subtests: []
        }
    });

    useEffect(() => {
        if(!test) return
        if(isEdit && test) {
            reset({
                test_name: test?.data.test_name,
                test_code: test?.data.test_code,
                is_active: test?.data.is_active
            });
        }
    }, [isEdit, test]);

    const allChildColumns: MRT_ColumnDef<any>[] = useMemo(
        () => [
            {
                header: "Name",
                accessorKey: "subtest_name",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Code",
                accessorKey: "subtest_code",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Total Series",
                accessorKey: "series_count",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Status",
                accessorKey: "is_active",
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
            }
        ],
        []
    );

    const selectedColumns: MRT_ColumnDef<any>[] = useMemo(
        () => [
            {
                header: "Name",
                accessorKey: "subtest_name",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Code",
                accessorKey: "subtest_code",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Added By",
                accessorKey: "added_by",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Added At",
                accessorKey: "added_at",
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
                    const subtest_name = row.original.subtest_name;
                    return (
                        <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                            <IconButton>
                                <InfoIcon />
                            </IconButton>
                            <IconButton color="error" onClick={ () => handleOpenDelete(id, subtest_name)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    )
                }
            },
        ],
        []
    );

    const availableColumns: MRT_ColumnDef<any>[] = useMemo(
        () => [
            {
                header: "Name",
                accessorKey: "subtest_name",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Code",
                accessorKey: "subtest_code",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Total Series",
                accessorKey: "series_count",
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
            },
            {
                header: "Actions",
                accessorKey: "actions",
                enableSorting: false,
                enableColumnFilter: false,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
                Cell: () => { //{ row }
                    // const id = row.original.id;
                    return (
                        <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                            <IconButton>
                                <InfoIcon />
                            </IconButton>
                        </Box>
                    )
                }
            },
        ],
        []
    );

    // Tabel yang sudah dipilih (saat edit)
    const selectedTable = useMaterialReactTable({
        columns: selectedColumns,
        data: test?.data.subtests ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableRowSelection: false,
        enableColumnFilters: true,
        enableSorting: true,
        enableRowActions: false,
    });

    // Tabel subtest yang masih bisa dipilih (saat edit)
    const availableTable = useMaterialReactTable({
        columns: availableColumns,
        data: availableSubtest?.data ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableRowSelection: true,
        enableColumnFilters: true,
        enableSorting: true,
        onRowSelectionChange: setSelectedRows,
        state: { rowSelection: selectedRows }
    });

    // Tabel semua subtest (jika mode create)
    const allTable = useMaterialReactTable({
       columns: allChildColumns,
        data: allSubtest?.data ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableRowSelection: true,
        enableColumnFilters: true,
        enableSorting: true,
        onRowSelectionChange: setSelectedRows,
        state: { rowSelection: selectedRows }
    });

    const handleOpenDelete = (id: string, subtest_name: string)=> {
        setSelectedTest({id, subtest_name});
        openDelete()
    }

    const onSubmit = async (values: any) => {
        showLoading();
        try {
            const payload = {
                test_name: values.test_name,
                test_code: values.test_code,
                is_active: values.is_active,
                subtests: Object.keys(selectedRows).map((id) => ({
                    subtest_id: id
                }))
            };

            if (isEdit) {
                await API.patch(`/test/${id}`, payload);
                snack.success("Test berhasil diperbarui");
                refetchTest();
                refetchAvailableSubtest();
            } else {
                delete payload.is_active;
                await API.post("/test", payload);
                snack.success("Test berhasil dibuat");
                navigate(-1);
            }
            refetchTest();
        } catch {
            snack.error("Terjadi kesalahan");
        } finally {
            hideLoading();
        }
    };

    const handleDelete = async (id: string, detailId: string) => {
        showLoading();
        try {
            const res = await API.delete(`/test/${id}/subtest/${detailId}`); // Pastikan endpoint benar
            refetchTest();
            refetchAvailableSubtest();
            snack.success(res.data?.message);
        } catch (error) {
            if (isAxiosError(error)) {
                const data = error.response?.data;
                snack.error(data?.message || "Terjadi kesalahan");
            } else {
                snack.error("Error, check log for details");
            }
        } finally {
            closeDelete();
            hideLoading();
        }
    };

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h2" color="primary">
                    {isEdit ? "Edit" : "New"} Test
                </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 1 }}>
                <TextFieldCtrl name="test_name" control={control} label="Name" rules={{ required: "Field required" }} />
                <TextFieldCtrl name="test_code" control={control} label="Code" rules={{ required: "Field required" }} />
            </Box>


            {isEdit ? (
                <>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <CheckboxCtrl name="is_active" control={control} label="Active" />
                        <Typography variant="h6">Taken Sub Tests</Typography>
                        <MaterialReactTable table={selectedTable} />
                        <Typography variant="h6">Available Sub Tests</Typography>
                        <MaterialReactTable table={availableTable} />
                    </Box>
                </>
            ) : (
                <>
                    <Typography variant="h6">Tests</Typography>
                    <MaterialReactTable table={allTable} />
                </>
            )}

            <Box textAlign="right" mt={4}>
                <Button
                    variant="contained"
                    onClick={async () => {
                        const valid = await trigger();
                        if (valid) open();
                    }}
                >
                    Save
                </Button>
            </Box>

            <DialogComp title={isEdit ? "Edit Test" : "Create Test"} open={isOpen} onClose={close} actions={[
                <Button onClick={close} variant="outlined" color="error">Cancel</Button>,
                <Button onClick={handleSubmit(onSubmit)} variant="contained" color="error">{isEdit ? "Edit" : "Create"}</Button>
            ]}>
                <Typography>{`Apakah Anda yakin ingin ${isEdit ? "mengedit" : "membuat"} Test?`}</Typography>
            </DialogComp>

            <DialogComp
                title="Delete Selected Test"
                open={isOpenDelete}
                onClose={closeDelete}
                actions={
                    <>
                        <Button onClick={closeDelete} variant="outlined" color="error">
                            Cancel
                        </Button>
                        {selectedTest && (
                            <Button
                                onClick={() => handleDelete(id!, selectedTest?.id)}
                                variant="contained"
                                color="error">
                                Delete
                            </Button>
                        )}
                    </>
                }
            >
                {selectedTest && (
                    <Typography>{`Are you sure you want to delete ${selectedTest.subtest_name}?`}</Typography>
                )}
            </DialogComp>
        </>
    );
};

export default TestCreateEdit;
