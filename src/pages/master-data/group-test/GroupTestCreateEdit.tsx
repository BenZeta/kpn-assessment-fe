import { Button, Typography, Box, IconButton } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import useFetch from "@/hooks/useFetch";
import useAPI from "@/hooks/useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { useLoading } from "@/providers/LoadingProvider";
import DialogComp from "@/components/Dialog";
import TextFieldCtrl from "@/components/forms/TextField";
import useDialog from "@/hooks/useDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";

const GroupTestCreateEdit = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const API = useAPI();
    const { showLoading, hideLoading } = useLoading();
    const { isOpen, open, close } = useDialog();
    const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();
    const navigate = useNavigate();

    // Fetch Data
    const { data: grouptest, refetch: refetchGroupTest } = useFetch(isEdit ? `/grouptest/${id}` : null);
    console.log(grouptest)
    const { data: availableSubtest, refetch: refetchAvailableSubtest } = useFetch(isEdit ? `/grouptest/${id}/subtests-available` : null);
    const { data: allSubtest } = useFetch(!isEdit ? `/subtest` : null);

    // State untuk menyimpan row selection
    const [selectedRows, setSelectedRows] = useState({});

    // Form Setup
    const { control, reset, handleSubmit, setValue, trigger } = useForm({
        defaultValues: { grouptest_name: "", grouptest_code: "", subtest: [] }
    });

    console.log(grouptest)

    // Load data ke form jika edit
    useEffect(() => {
        if (isEdit && grouptest) {
            reset({
                grouptest_name: grouptest?.data?.grouptest_name,
                grouptest_code: grouptest?.data?.grouptest_code
            });

            // Atur selectedRows untuk menandai yang sudah dipilih
            const preSelected = {};
            grouptest?.data?.subtests?.forEach((s) => {
                preSelected[s.id] = true;
            });

            setSelectedRows(preSelected);
            setValue("subtest", Object.keys(preSelected));
        }
    }, [grouptest, reset, isEdit]);

    // Konfigurasi Kolom
    const columns = useMemo(
        () => [
            { header: "Nama Sub Test", accessorKey: "subtest_name" },
            { header: "Kode Sub Test", accessorKey: "subtest_code" },
            { header: "Nama Kategori", accessorKey: "category_name" },
            { header: "Kode Kategori", accessorKey: "category_code" },
            { header: "Jumlah Series", accessorKey: "series_count" },
        ],
        []
    );

    // Handle perubahan checkbox
    const handleRowSelectionChange = (updater) => {
        const newSelection = typeof updater === "function" ? updater(selectedRows) : updater;
        setSelectedRows(newSelection);
        setValue("subtest", Object.keys(newSelection));
    };

    // Tabel yang sudah dipilih
    const selectedTable = useMaterialReactTable({
        columns,
        data: grouptest?.data?.subtests ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableRowSelection: false,
        enableColumnFilters: true,
        enableSorting: true,
        enableRowActions: true,
        renderRowActions: ({ row }) => (
            <IconButton
                color="error"
                onClick={async () => {
                    try {
                        await API.delete(`/grouptest/${id}/subtests/${row.original.id}`);
                        snack.success("Subtest berhasil dihapus");
                        refetchGroupTest();
                    } catch {
                        snack.error("Gagal menghapus Subtest");
                    }
                }}
            >
                <DeleteIcon />
            </IconButton>
        ),
    });

    // Tabel subtest yang bisa dipilih
    const availableTable = useMaterialReactTable({
        columns,
        data: availableSubtest?.data ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableRowSelection: true,
        enableColumnFilters: true,
        enableSorting: true,
        onRowSelectionChange: handleRowSelectionChange,
        state: { rowSelection: selectedRows }
    });

    // Tabel semua subtest (jika mode create)
    const allTable = useMaterialReactTable({
        columns,
        data: allSubtest?.data ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableRowSelection: true,
        enableColumnFilters: true,
        enableSorting: true,
        onRowSelectionChange: handleRowSelectionChange,
        state: { rowSelection: selectedRows }
    });

    // Handle Submit Form
    const onSubmit = async (values) => {
        showLoading();
        try {
            const payload = {
                grouptest_name: values.grouptest_name,
                grouptest_code: values.grouptest_code,
                is_active: true,
                subtests: Object.keys(selectedRows).map((id) => ({
                    subtest_id: id
                }))
            };

            const payloadAddSubTest = {
                subtests: Object.keys(selectedRows).map((id) => ({
                    subtest_id: id
                }))
            }

            console.log(payload);

            if (isEdit) {
                await API.patch(`/grouptest/${id}`, payload);
                await API.post(`/grouptest/${id}/subtests`, payloadAddSubTest);
                snack.success("Group Test berhasil diperbarui");
                refetchGroupTest();
                refetchAvailableSubtest();
            } else {
                await API.post("/grouptest", payload);
                snack.success("Group Test berhasil dibuat");
                navigate(-1);
            }
            refetchGroupTest();
        } catch {
            snack.error("Terjadi kesalahan");
        } finally {
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
                    {isEdit ? "Edit" : "New"} Group Test
                </Typography>
            </Box>

            <TextFieldCtrl name="grouptest_name" control={control} label="Nama Group Test" rules={{ required: "Field required" }} />
            <TextFieldCtrl name="grouptest_code" control={control} label="Kode Group Test" rules={{ required: "Field required" }} />

            {isEdit ? (
                <>
                    <Typography variant="h6">Sub Test yang Sudah Dipilih</Typography>
                    <MaterialReactTable table={selectedTable} />
                    <br />
                    <Typography variant="h6">Pilih Sub Test</Typography>
                    <MaterialReactTable table={availableTable} />
                </>
            ) : (
                <>
                    <Typography variant="h6">Pilih Sub Test</Typography>
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

            <DialogComp title={isEdit ? "Edit Group Test" : "Create Group Test"} open={isOpen} onClose={close} actions={[
                <Button onClick={close} variant="outlined" color="error">Cancel</Button>,
                <Button onClick={handleSubmit(onSubmit)} variant="contained" color="error">{isEdit ? "Edit" : "Create"}</Button>
            ]}>
                <Typography>{`Apakah Anda yakin ingin ${isEdit ? "mengedit" : "membuat"} Group Test?`}</Typography>
            </DialogComp>
        </>
    );
};

export default GroupTestCreateEdit;
