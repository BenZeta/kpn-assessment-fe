import useAPI from "@/hooks/useAPI.tsx";
import useAuthStore from "@/hooks/useAuthStore.tsx";
import { useLoading } from "@/providers/LoadingProvider.tsx";
import useFetch from "@/hooks/useFetch.tsx";
import { useMemo, useState } from "react";
import useDialog from "@/hooks/useDialog.tsx";
import { Box, Button, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import {MaterialReactTable, MRT_ColumnDef, useMaterialReactTable} from "material-react-table";
import { TableSkeleton } from "@/components/Skeleton.tsx";
import DialogComp from "@/components/Dialog.tsx";
import { snack } from "@/providers/SnackbarProvider.tsx";
import { isAxiosError } from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";

export const Test = () => {
    const API = useAPI();
    const navigate = useNavigate();
    const getPermission = useAuthStore((state) => state.getPermission);
    const { showLoading, hideLoading } = useLoading();
    const { data: test, refetch } = useFetch<{ data: any[] }>("/test");
    const [selectedTest, setSelectedTest] = useState<{ id: string; test_name: string } | null>(null);
    const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();

    const columns: MRT_ColumnDef<any>[] = useMemo(
        () => [
            {
                header: "Name",
                accessorKey: "test_name",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Code",
                accessorKey: "test_code",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Total Sub Test",
                accessorKey: "subtest_count",
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
                Cell: ({ row }) => {
                    const id = row.original.id;
                    const test_name = row.original.test_name;
                    return (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <IconButton>
                                <InfoIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => navigate(`/admin/test/edit/${id}`)}
                                aria-label="edit"
                                size="small"
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                color="error"
                                onClick={ () => handleOpenDelete(id, test_name)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    )
                }
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: test?.data ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableColumnFilters: true,
        enableSorting: true,
        enableRowSelection: false,
        enableRowActions: false, // Matikan renderRowActions karena sudah ada di columns
    });

    const handleOpenDelete = (id: string, test_name: string)=> {
        setSelectedTest({id, test_name});
        openDelete();
    }

    const handleDelete = async (id: string) => {
        showLoading();
        try {
            const res = await API.delete(`/test/${id}`); // Pastikan endpoint benar
            refetch();
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
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2}}>
                <Typography variant="h2" component="div">
                    Test
                    {getPermission("fcreate", 14) && (
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            onClick={() => navigate(`/admin/test/create`)}
                            sx={{ ml: 2 }}
                        >
                            Create Test
                        </Button>
                    )}
                </Typography>
            </Box>


            {test?.data?.length ? (
                getPermission("fread", 14) && <MaterialReactTable table={table} />
            ) : (
                <TableSkeleton column={4} row={2} small />
            )}

            <DialogComp
                title="Delete Group Test"
                open={isOpenDelete}
                onClose={closeDelete}
                actions={
                    <>
                        <Button onClick={closeDelete} variant="outlined" color="error">
                            Cancel
                        </Button>
                        {selectedTest && (
                            <Button
                                onClick={() => handleDelete(selectedTest?.id)}
                                variant="contained"
                                color="error">
                                Delete
                            </Button>
                        )}
                    </>
                }
            >
                {selectedTest && (
                    <Typography>{`Are you sure you want to delete ${selectedTest.test_name}?`}</Typography>
                )}
            </DialogComp>
        </Box>
    );
};
