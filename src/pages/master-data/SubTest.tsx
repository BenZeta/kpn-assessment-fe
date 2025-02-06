import { Autocomplete, Button, IconButton, TextField, Typography, Box } from "@mui/material";
import StandardTable from "../../components/StandardTable";
import { useEffect, useMemo, useState } from "react";
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
import CheckboxCtrl from "@/components/forms/Checkbox";
import AddIcon from "@mui/icons-material/Add";
import useAuthStore from "@/hooks/useAuthStore";
import { SubTestValue } from "@/types/MasterData";
import useAPI from "@/hooks/useAPI";
import { formatDateTime } from "@/utils/helper";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export const SubTest = () => {
    const API = useAPI();
    const getPermission = useAuthStore((state) => state.getPermission);
    const { showLoading, hideLoading } = useLoading();
    const { data: subtest, refetch } = useFetch<any>("/subtest");
    const [selectedSubtestId, setSelectedSubtestId] = useState<string | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();
    const { isOpen: isOpenForm, open: openForm, close: closeForm } = useDialog();

    // State untuk criteria, categories, dan series
    const [criteria, setCriteria] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [loadingSeries, setLoadingSeries] = useState(false);

    const {
        control,
        reset,
        handleSubmit,
        watch,
        formState: { isDirty, errors },
    } = useForm<SubTestValue>({
        defaultValues: {
            subtest_name: "",
            subtest_code: "",
            criteria_id: "",
            category_id: "",
            series: [],
            is_active: true,
        },
    });

    const watchedCategory = watch("category_id");
    console.log(`Wathed id: ${watchedCategory}`)

    useEffect(() => {
        const fetchCriteria = async () => {
            try {
                const response = await API.get("/criteria");
                setCriteria(response.data.data);
                console.log(response.data.data)
            } catch (error) {
                snack.error("Gagal memuat kategori");
                console.error(error);
            }
        };

        fetchCriteria();
    }, []);

    // Fetch categories saat komponen pertama kali di-render
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await API.get("/category");
                setCategories(response.data.data);
            } catch (error) {
                snack.error("Gagal memuat kategori");
                console.error(error);
            }
        };

        fetchCategories();
    }, []);

    // Fetch series berdasarkan category_id yang dipilih
    useEffect(() => {
        const fetchSeries = async () => {
            if (watchedCategory) {
                setLoadingSeries(true);
                try {
                    const response = await API.get(`/series/category/${watchedCategory}`);
                    console.log(response.data.data);
                    console.log("hi");
                    setSeries(response.data.data);
                } catch (error) {
                    snack.error("Gagal memuat series");
                    console.error(error);
                } finally {
                    setLoadingSeries(false);
                }
            } else {
                setSeries([]); // Reset series jika tidak ada kategori yang dipilih
            }
        };

        fetchSeries();
    }, [watchedCategory]);

    const columns = useMemo(
        () => [
            {
                header: "Nama",
                accessorKey: "subtest_name",
                cell: (props: any) => props.getValue(),
            },
            {
                header: "Kode",
                accessorKey: "subtest_code",
                cell: (props: any) => props.getValue(),
            },
            {
                header: "Total Series",
                accessorKey: "series_count",
                cell: (props: any) => props.getValue() || 0,
            },
            {
                header: "Status",
                accessorKey: "is_active",
                cell: (props: any) => (props.getValue() ? "Active" : "Inactive"),
            },
            {
                header: "Kategori",
                accessorKey: "category_name",
                cell: (props: any) => props.getValue(),
            },
            {
                header: "Created By",
                accessorKey: "created_by",
                cell: (props: any) => props.getValue(),
            },
            {
                header: "Created At",
                accessorKey: "created_at",
                cell: (props: any) => formatDateTime(props.getValue()) || '-',
            },
            {
                header: "Action",
                accessorKey: "id",
                meta: { align: "right" },
                cell: (props: any) => (
                    <>
                        {getPermission("fupdate", 12) && (
                            <IconButton
                                onClick={() => handleOpenForm(props.row.original)}
                                aria-label="edit"
                                size="small"
                                edge="end"
                                sx={{ mr: 1 }}
                            >
                                <EditIcon />
                            </IconButton>
                        )}
                        {getPermission("fdelete", 12) && (
                            <IconButton
                                onClick={() => handleOpenDelete(props.getValue(), props.row.original.subtest_name)}
                                aria-label="delete"
                                color="error"
                                size="small"
                                edge="end"
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </>
                ),
            },
        ],
        []
    );

    const handleCloseForm = () => {
        reset();
        closeForm();
    };

    const handleOpenDelete = (id: string, name: string) => {
        setSelectedSubtestId({id, name});
        openDelete();
    };

    const handleDelete = async () => {
        if (!selectedSubtestId) return;
        showLoading();
        try {
            await API.delete(`/subtest/${selectedSubtestId}`);
            refetch();
            snack.success("Subtest berhasil dihapus");
        } catch (error) {
            snack.error("Gagal menghapus subtest");
        } finally {
            closeDelete();
            hideLoading();
        }
    };

    const handleOpenForm = (data?: SubTestValue) => {
        if (data) {
            setIsEdit(true);
            setSelectedSubtestId(data.id);
            reset({
                ...data,
                category_id: data.category_id,
                series: data.series
            });
        } else {
            setIsEdit(false);
            reset({
                subtest_name: "",
                subtest_code: "",
                category_id: "",
                series: [],
                is_active: true
            });
        }
        openForm();
    };

    const onSubmit = async (values: any) => {
        showLoading();
        try {
            const payload: SubTestValue = {
                subtest_name: values.subtest_name,
                subtest_code: values.subtest_code,
                criteria_id: values.criteria_id,
                category_id: values.category_id,
                is_active: values.is_active,
                series: values.series.map((s: { id: string }) => ({
                    series_id: s.id
                }))
            };

            console.log(payload)

            if (isEdit && selectedSubtestId) {
                await API.patch(`/subtest/${selectedSubtestId}`, payload);
                snack.success("Subtest berhasil diperbarui");
            } else {
                await API.post("/subtest", payload);
                snack.success("Subtest berhasil dibuat");
            }
            refetch();
            handleCloseForm();
        } catch (error) {
            snack.error("Terjadi kesalahan");
        } finally {
            hideLoading();
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Manajemen Subtest
                {getPermission("fcreate", 12) && (
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={() => handleOpenForm()}
                        sx={{ ml: 2 }}
                    >
                        Subtest Baru
                    </Button>
                )}
            </Typography>

            {subtest ? (
                <StandardTable columns={columns} data={subtest.data} />
            ) : (
                <TableSkeleton column={columns.length} row={5} />
            )}

            <DialogComp
                title={`${isEdit ? 'Edit' : 'Buat'} Subtest`}
                open={isOpenForm}
                onClose={handleCloseForm}
                actions={[
                    <Button key="cancel" onClick={handleCloseForm}>Batal</Button>,
                    <Button
                        key="submit"
                        onClick={handleSubmit(onSubmit)}
                        variant="contained"
                        disabled={!isDirty}
                    >
                        Simpan
                    </Button>
                ]}
            >
                <TextFieldCtrl
                    name="subtest_name"
                    control={control}
                    label="Nama Subtest"
                    rules={{ required: "Wajib diisi" }}
                />

                <TextFieldCtrl
                    name="subtest_code"
                    control={control}
                    label="Kode Subtest"
                    rules={{ required: "Wajib diisi" }}
                />

                <Controller
                    name="criteria_id"
                    control={control}
                    rules={{ required: "Pilih Kriteria" }}
                    render={({ field }) => (
                        <Autocomplete
                            options={criteria}
                            getOptionLabel={(option) => option.value_name || "Unknown"}
                            isOptionEqualToValue={(option, value) => option.value_id === value.value_id}
                            onChange={(_, value) => field.onChange(value?.value_id || "")}
                            value={criteria.find((c) => c.value_id === field.value) || null}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Pilih Kriteria"
                                    error={!!errors.criteria_id}
                                    helperText={errors.criteria_id?.message}
                                />
                            )}
                        />
                    )}
                />

                <Controller
                    name="category_id"
                    control={control}
                    rules={{ required: "Pilih kategori" }}
                    render={({ field }) => (
                        <Autocomplete
                            options={categories}
                            getOptionLabel={(option) => option.category_name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(_, value) => field.onChange(value?.id || "")}
                            value={categories.find((c) => c.id === field.value) || null}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Pilih Kategori"
                                    error={!!errors.category_id}
                                    helperText={errors.category_id?.message}
                                    sx={{mt: 2}}
                                />
                            )}
                        />
                    )}
                />

                <Controller
                    name="series"
                    control={control}
                    rules={{ required: "Pilih series" }}
                    render={({ field }) => (
                        <Autocomplete
                            multiple
                            disabled={!watchedCategory || loadingSeries}
                            options={series}
                            getOptionLabel={(option) => option.series_name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            disableCloseOnSelect
                            onChange={(_, values) => field.onChange(values)}
                            value={field.value}
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        checked={selected}
                                    />
                                    {option.series_name}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Series Terkait"
                                    placeholder="Pilih Series"
                                    error={!!errors.series}
                                    helperText={errors.series?.message}
                                    sx={{mt: 2}}
                                />
                            )}
                        />
                    )}
                />

                <CheckboxCtrl
                    name="is_active"
                    control={control}
                    label="Status Aktif"
                />
            </DialogComp>

            <DialogComp
                title="Konfirmasi Hapus"
                open={isOpenDelete}
                onClose={closeDelete}
                actions={[
                    <Button key="cancel" onClick={closeDelete}>Batal</Button>,
                    <Button
                        key="delete"
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                    >
                        Hapus
                    </Button>
                ]}
            >
                <Typography>Apakah Anda yakin ingin menghapus subtest ini?</Typography>
            </DialogComp>
        </Box>
    );
};