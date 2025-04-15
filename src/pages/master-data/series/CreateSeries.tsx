import TextFieldCtrl from "@/components/forms/TextField";
import AutoCompleteComp from "@/components/forms/AutoCompleteComp";
import QuestionCard from "@/components/question/QuestionCard";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { SeriesValues } from "@/types/MasterData";
import { ArrowBack, Visibility } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Grid2 as Grid,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionData } from "@/components/question/QuestionCard";
import { useParams } from "react-router-dom";
import { AxiosError, isAxiosError } from "axios";

const CreateSeries: React.FC = () => {
  const {
    refineCore: { formLoading },
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      series_name: "",
      series_code: "",
      category_id: "",
      question_id: [],
      detail: [],
    },
  });

  const { open: openModal, isOpen: isOpenModal, close: closeModal } = useDialog();

  const navigate = useNavigate();
  const API = useAPI();
  const { id: id_series } = useParams();
  const user_id = useAuthStore(state => state.user_id);
  const getPermission = useAuthStore(state => state.getPermission);
  const { showLoading, hideLoading } = useLoading();
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(null);
  const { data: categories } = useFetch<{
    data: { id: string; category_code: string; category_name: string }[];
  }>("/category");
  const { data: question } = useFetch<any>("/question");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const handleCategoryChange = (_: any, value: any) => {
    setValue("category_id", value?.id || null);
  };

  const categoriesOptions = useMemo(() => {
    if (!categories?.data) {
      return [];
    }
    return categories.data.map(item => {
      return {
        value: item.id,
        label: `${item.category_code} - ${item.category_name}`,
      };
    });
  }, [categories]);

  const filteredQuestions = useMemo(() => {
    const category_id = getValues("category_id");
    if (!category_id) return [];
    return question?.data.filter((q: any) => q.category_id === category_id) || [];
  }, [watch("category_id"), question]);

  const columns: MRT_ColumnDef<any>[] = useMemo(
    () => [
      {
        header: "Question",
        accessorKey: "q_input_text",
      },
      {
        header: "Code",
        accessorKey: "question_code",
      },
      {
        header: "Created By",
        accessorKey: "created_by",
      },
      {
        header: "Created At",
        accessorKey: "created_at",
      },
      {
        id: "actions",
        header: "Actions",
        enableColumnActions: false,
        enableSorting: false,
        enableResizing: false,
        size: 50,
        Cell: ({ row }) => (
          <IconButton onClick={() => handleOpenModal(row.original, row.id)}>
            <Visibility />
          </IconButton>
        ),
      },
    ],
    []
  );

  const onSubmit = async (data: SeriesValues) => {
    try {
      showLoading();
      const payload = {
        series_name: data.series_name,
        series_code: data.series_code,
        category_id: data.category_id,
        created_by: user_id,
        questions: Object.keys(rowSelection).map(id => ({
          question_id: id,
        })),
        is_active: true,
      };

      if (!id_series) {
        const response = await API.post("/series", payload);
        snack.success("Series created successfully");
      } else {
        let { data } = await API.patch(`/series/${id_series}`, payload);
        snack.success(data.message);
      }

      reset();
      setRowSelection({});
      navigate("/admin/series");
    } catch (error) {
      console.error(error);
      snack.error("Failed to create series");
    } finally {
      hideLoading();
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: filteredQuestions,
    getRowId: row => row.id, // Pastikan row menggunakan ID yang unik
    state: {
      rowSelection, // Sync state selection dengan tabel
    },
    onRowSelectionChange: setRowSelection, // Update state saat selection berubah
    // isLoading,
    enablePagination: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableRowSelection: true,
  });

  const handleOpenModal = (row: any, id?: string) => {
    setSelectedQuestion(row);
    console.log("Selected Question: ", JSON.stringify(row, null, 2));
    openModal();
  };

  useEffect(() => {
    if (!id_series) return;
    (async () => {
      try {
        const { data } = await API.get(`/series/create/${id_series}`);
        const series_dt = data.data;
        let question_id_parsetable: { [k: string]: boolean } = {};
        series_dt.questions_id.map((value: string) => {
          question_id_parsetable[value] = true;
        });
        setRowSelection(question_id_parsetable);
        reset({
          series_name: series_dt.series_name,
          series_code: series_dt.series_code,
          category_id: series_dt.category_id,
          question_id: series_dt.questions_id,
        });
      } catch (error) {
        console.error(error);
        if (isAxiosError(error)) {
          snack.error(error.response?.data.message);
        }
      }
    })();
  }, [id_series]);

  return (
    <Create
      title={
        <Typography variant="h6" fontWeight="600">
          Create a New Series
        </Typography>
      }
      isLoading={formLoading}
      saveButtonProps={{
        onClick: handleSubmit(onSubmit),
        disabled: isSubmitting,
      }}
      goBack={<IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextFieldCtrl
            control={control}
            name="series_name"
            label="Series Name"
            rules={{ required: true }}
            placeholder="Input series name here"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextFieldCtrl
            control={control}
            name="series_code"
            label="Series Code"
            rules={{ required: true }}
            placeholder="Input series code here"
            toUpperCase={true}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AutoCompleteComp
            control={control}
            options={categoriesOptions || []}
            name="category_id"
            label="Category"
          />
        </Grid>
      </Grid>
      <Box mt={2}>
        <MaterialReactTable table={table} />
      </Box>
      <Modal
        keepMounted
        open={isOpenModal}
        onClose={closeModal}
        sx={{
          alignContent: "center",
          justifySelf: "center",
          width: "80%",
          maxWidth: "sm",
        }}
      >
        <Box
          sx={{
            maxWidth: "sm",
            maxHeight: "90vh", // Set maximum height relative to viewport height
            bgcolor: "background.paper",
            borderRadius: 1,
            p: 2,
            overflow: "auto", // Enable scrolling
          }}
        >
          <QuestionCard questionData={selectedQuestion} />
        </Box>
      </Modal>
    </Create>
  );
};
export default CreateSeries;
