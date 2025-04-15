import useAPI from "@/hooks/useAPI";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { Visibility } from "@mui/icons-material";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Control, useFormContext } from "react-hook-form";
import DialogComp from "../Dialog";
import TextFieldCtrl from "../forms/TextField";
import QuestionCard, { QuestionData } from "../question/QuestionCard";

type IntroductionProps = {
  control: Control<any>;
};

const Introduction: React.FC<IntroductionProps> = ({ control }) => {
  const API = useAPI();
  const { setValue, watch } = useFormContext();
  const series_example_id = watch("series_example_id") || "";
  const isUpdatingForm = useRef(false);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const { showLoading, hideLoading } = useLoading();

  const { data: allSeries } = useFetch<any>("/series");

  // Set row selection state berdasarkan series_example_id
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const { open, close, isOpen } = useDialog();

  useEffect(() => {
    if (!series_example_id || !allSeries?.data) return;

    const newSelection: Record<string, boolean> = {};
    newSelection[series_example_id] = true;
    setRowSelection(newSelection);
  }, [series_example_id, allSeries?.data]);

  useEffect(() => {
    if (isUpdatingForm.current || !allSeries?.data) return;

    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
    const selectedId = selectedIds.length > 0 ? selectedIds[0] : "";
    if (selectedId !== series_example_id) {
      isUpdatingForm.current = true;
      setValue("series_example_id", selectedId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    setTimeout(() => {
      isUpdatingForm.current = false;
    }, 0);
  }, [rowSelection, allSeries?.data, setValue, series_example_id]);

  const handleOpenModal = async (id: string) => {
    try {
      showLoading();
      // Menggunakan axios langsung untuk mendapatkan respons penuh
      const series = await API.get(`/series/${id}`);
      const seriesData = series.data;
      console.log(JSON.stringify(seriesData, null, 2));

      // Mengambil questions dari seriesData
      const formattedQuestions = seriesData.data.questions.map((question: any) => ({
        id: question.question_id,
        q_input_text: question.input_text,
        q_input_image_url: question.input_image_url,
        answer_type: question.answer_type,
        category_name: question.category_name,
        answers: question.answers
          .filter((answer: any) => answer.text !== null)
          .map((answer: any) => ({
            text: answer.text || "",
            image_url: answer.image,
            point: answer.point || "0",
          })),
      }));

      setQuestions(formattedQuestions);
      open(); // Buka modal setelah data siap
    } catch (error) {
      console.error("Error fetching series example:", error);
    } finally {
      hideLoading();
    }
  };

  const columns: MRT_ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "series_name",
        header: "Title",
      },
      {
        accessorKey: "question_count",
        header: "Total Question",
      },
      {
        accessorKey: "created_by",
        header: "Created By",
      },
      {
        accessorKey: "created_at",
        header: "Created At",
      },
      {
        accessorKey: "action",
        header: "Action",
        enableSorting: false,
        enableColumnFilter: false,
        size: 100,
        Cell: ({ row }) => {
          const id = row.original.id;
          return (
            <>
              <IconButton
                children={<Visibility />}
                size="small"
                onClick={() => handleOpenModal(id)}
              />
            </>
          );
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns: columns,
    data: allSeries?.data ?? [],
    getRowId: row => row.id,
    enablePagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection: rowSelection,
    },
    initialState: {
      density: "compact",
    },
    enableMultiRowSelection: false,
  });

  return (
    <>
      <Box sx={{ mb: 4, px: 6 }}>
        <Typography variant="h6" color="textSecondary" fontWeight={600}>
          Introduction to the Subtest
        </Typography>
        <Typography variant="body1" color="textSecondary">
          The introduction page is intended to provide instructions for working on problems from the
          given subtest. So write the description as clearly as possible and add the appropriate
          example series.
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={2} sx={{ px: 6 }}>
        <TextFieldCtrl
          control={control}
          label="Introduction Description"
          name="intro_desc"
          rules={{ required: "Introduction Description is required" }}
          multiline
          rows={4}
          placeholder="Enter introduction description here..."
        />
        <Box>
          <Typography variant="h6" color="textSecondary" fontWeight={600}>
            Introduction Series
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Choose an introduction series for the Subtest
          </Typography>
        </Box>
        <MaterialReactTable table={table} />
      </Stack>
      <DialogComp title="Preview Questions" open={isOpen} onClose={close} maxWidth="md">
        <Stack spacing={2} sx={{ overflow: "auto" }}>
          {questions && questions.length > 0 ? (
            questions.map((question: QuestionData) => (
              <QuestionCard key={question.id} questionData={question} disabled={true} />
            ))
          ) : (
            <Typography>No questions available</Typography>
          )}
        </Stack>
      </DialogComp>
    </>
  );
};

export default Introduction;
