import React, { useMemo } from 'react';
import {
    Box,
    Card,
    Typography,
    Grid,
    Chip,
    Divider,
    IconButton
} from '@mui/material';
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate, useParams } from 'react-router-dom';
import useFetch from "@/hooks/useFetch";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const GroupTestDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch subtest detail and criteria
    const { data: testDetail } = useFetch<{ data: any }>(`/grouptest/${id}`);

    const testColumns: MRT_ColumnDef<any>[] = useMemo(
        () => [
            {
                header: "Test Name",
                accessorKey: "test_name",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Test Code",
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
                Cell: ({row}) => {
                    const testId = row.original.test_id;
                    return (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <IconButton
                                onClick={() => navigate(`/admin/test/detail/${testId}`)}
                                aria-label="edit"
                                size="small">
                                <VisibilityIcon />
                            </IconButton>
                        </Box>
                    )
                }
            },
        ],
        []
    );

    // Tables Configuration
    const subtestTable = useMaterialReactTable({
        columns: testColumns,
        data: testDetail?.data?.tests || [],
        enablePagination: true,
        enableColumnFilters: false,
        enableSorting: true,
    });

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h2" color="primary" gutterBottom>
                    Group Test {testDetail?.data.grouptest_code}
                </Typography>
            </Box>

            <Box>
                <Grid container spacing={2}>
                    {/* Subtest Information */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Group Test Details</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>Name: {testDetail?.data.grouptest_name}</Typography>
                            <Typography>Code: {testDetail?.data.grouptest_code}</Typography>
                            <Typography>
                                Status:
                                <Chip
                                    label={testDetail?.data.is_active ? 'Active' : 'Inactive'}
                                    color={testDetail?.data.is_active ? 'success' : 'error'}
                                    size="small"
                                    sx={{ ml: 1 }}
                                />
                            </Typography>
                        </Card>
                    </Grid>

                    {/* Information Card */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Information</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>Created By: {testDetail?.data.created_by}</Typography>
                            <Typography>Created At: {formatDate(testDetail?.data.created_at)}</Typography>
                            <Typography>Updated By: {testDetail?.data.updated_by}</Typography>
                            <Typography>Updated At: {formatDate(testDetail?.data.updated_at)}</Typography>
                        </Card>
                    </Grid>

                    {/* Test Table */}
                    <Grid item xs={12}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Test
                            </Typography>
                            <MaterialReactTable table={subtestTable} />
                        </Card>
                    </Grid>
                </Grid>
            </Box>


        </>
    );
};

export default GroupTestDetail;