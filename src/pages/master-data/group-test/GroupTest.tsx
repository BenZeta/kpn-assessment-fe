import useAPI from "@/hooks/useAPI.tsx";
import useAuthStore from "@/hooks/useAuthStore.tsx";
import { useLoading } from "@/providers/LoadingProvider.tsx";
import useFetch from "@/hooks/useFetch.tsx";
import { useMemo, useState } from "react";
import useDialog from "@/hooks/useDialog.tsx";
import { Box, Button, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { TableSkeleton } from "@/components/Skeleton.tsx";
import DialogComp from "@/components/Dialog.tsx";
import { snack } from "@/providers/SnackbarProvider.tsx";
import { isAxiosError } from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";

export const GroupTest = () => {
    const API = useAPI();
    const navigate = useNavigate();
    const getPermission = useAuthStore((state) => state.getPermission);
    const { showLoading, hideLoading } = useLoading();

    // Pastikan data selalu array agar tidak error
    const { data: grouptest, refetch } = useFetch<{ data: any[] }>("/grouptest");

    const [selectedGroupTest, setSelectedGroupTest] = useState<{ id: string; grouptest_name: string } | null>(null);
    const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();

    const columns = useMemo(
        () => [
            {
                header: "Nama",
                accessorKey: "grouptest_name",
            },
            {
                header: "Kode",
                accessorKey: "grouptest_code",
            },
            {
                header: "Jumlah Sub Test",
                accessorKey: "subtest_count",
            },
            {
                header: "Status",
                accessorKey: "is_active",
            },
            {
                header: "Created By",
                accessorKey: "created_by",
            },
            {
                header: "Created At",
                accessorKey: "created_at",
            },
            // {
            //     header: "Action",
            //     accessorKey: "id",
            //     meta: { align: "right" },
            //     Cell: ({ row } : any) => {
            //         const { id, grouptest_name } = row.original; // Akses data yang benar
            //
            //         return (
            //             getPermission("fdelete", 13) && (
            //                 <>
            //                     <IconButton
            //                         onClick={() => handleOpenDelete(id, grouptest_name)}
            //                         aria-label="delete"
            //                         color="error"
            //                         size="small"
            //                         edge="end"
            //                     >
            //                         <DeleteIcon />
            //                     </IconButton>
            //
            //                     <IconButton
            //                         onClick={() => navigate(`/admin/grouptest/edit/${row.original.id}`)}
            //                         aria-label="edit"
            //                         size="small"
            //                         edge="end"
            //                     >
            //                         <EditIcon />
            //                     </IconButton>
            //                 </>
            //
            //
            //
            //             ));
            //     },
            // },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: grouptest?.data ?? [], // Pastikan data tidak undefined
        getRowId: (row) => row.id,
        enablePagination: true,
        enableColumnFilters: true,
        enableSorting: true,
        enableRowSelection: true,
        enableRowActions: true,
        renderRowActions: ({ row }) => (
            <Box sx={{ display: "flex", flexWrap: "nowrap", gap: "8px" }}>
                <IconButton>
                    <InfoIcon/>
                </IconButton>

                <IconButton
                    onClick={() => navigate(`/admin/grouptest/edit/${row.id}`)}
                    aria-label="edit"
                    size="small"
                    edge="end"
                >
                    <EditIcon/>
                </IconButton>

                <IconButton
                    color="error"
                    onClick={async () => {
                        try {
                            await API.delete(`/grouptest/${row.id}`);
                            snack.success("Subtest berhasil dihapus");
                            refetch();
                        } catch {
                            snack.error("Gagal menghapus Subtest");
                        }
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ),
    });

    const handleOpenDelete = (id: string, grouptest_name: string) => {
        setSelectedGroupTest({ id, grouptest_name });
        openDelete();
    };

    const handleDelete = async () => {
        if (!selectedGroupTest) return;

        showLoading();
        try {
            const res = await API.delete(`/grouptest/${selectedGroupTest.id}`); // Pastikan endpoint benar
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
            <Typography variant="h2" component="div">
                Group Test
                {getPermission("fcreate", 13) && (
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={() => navigate(`/admin/grouptest/create`)}
                        sx={{ ml: 2 }}
                    >
                        Buat Group Test
                    </Button>
                )}
            </Typography>

            {grouptest?.data?.length ? (
                getPermission("fread", 13) && <MaterialReactTable table={table} />
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
                        {selectedGroupTest && (
                            <Button onClick={handleDelete} variant="contained" color="error">
                                Delete
                            </Button>
                        )}
                    </>
                }
            >
                {selectedGroupTest && (
                    <Typography>{`Are you sure you want to delete ${selectedGroupTest.grouptest_name}?`}</Typography>
                )}
            </DialogComp>
        </Box>
    );
};
