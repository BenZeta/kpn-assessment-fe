import useAPI from "@/hooks/useAPI";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { Visibility } from "@mui/icons-material";
import {
  Box,
  Divider,
  Grid2 as Grid,
  IconButton,
  Stack,
  Typography
} from "@mui/material";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Control, useFormContext } from "react-hook-form";
import CustomSwitch from "../CustomSwitch";
import DialogComp from "../Dialog";
import TextFieldCtrl from "../forms/TextField";
import TimePickerCtrl from "../forms/TimePicker";
import QuestionCard, { QuestionData } from "../question/QuestionCard";

type SubtestProps = {
  control: Control<any>;
};

const Subtest: React.FC<SubtestProps> = ({ control }) => {
  const API = useAPI();
  const { setValue, watch } = useFormContext();
  const selectedSeries = watch("series") || [];
  const [rowSelection, setRowSelection] = useState({});
  const isInitialMount = useRef(true);
  const isUpdatingForm = useRef(false);
  const { open, close, isOpen } = useDialog();
  const [questions, setQuestions] = useState<any[]>([]);
  const [enableDuration, setEnableDuration] = useState(false);

  const { showLoading, hideLoading } = useLoading();

  // const { data: criteria } = useFetch<any>("/criteria");
  const { data: allSeries } = useFetch<any>("/series");

  useEffect(() => {
    if (isInitialMount.current && allSeries?.data) {
      const initialSelection: Record<string, boolean> = {};

      selectedSeries.forEach((item: any) => {
        if (item.series_id) {
          initialSelection[item.series_id] = true;
        }
      });

      if (Object.keys(initialSelection).length > 0) {
        setRowSelection(initialSelection);
      }

      isInitialMount.current = false;
    }
  }, [selectedSeries, allSeries]);

  useEffect(() => {
    // Skip if we're in the initialization phase
    if (isInitialMount.current || isUpdatingForm.current || !allSeries?.data) {
      return;
    }

    const selectedIds = Object.keys(rowSelection).filter(
      id => rowSelection[id as keyof typeof rowSelection]
    );

    const selectedSeriesData = selectedIds.map(id => ({ series_id: id }));

    isUpdatingForm.current = true;

    // Update the form
    setValue("series", selectedSeriesData, {
      shouldDirty: true,
      shouldTouch: true,
    });

    setTimeout(() => {
      isUpdatingForm.current = false;
    }, 0);
  }, [rowSelection, setValue, allSeries]);

  const handleOpenModal = async (id: string) => {
    try {
      showLoading();
      const series = await API.get(`/series/${id}`);
      const seriesData = series.data;
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
      open();
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
  });

  return (
    <>
      <Box sx={{ mb: 4, px: 6 }}>
        <Typography variant="h6" color="textSecondary" fontWeight={600}>
          Subtest Information
        </Typography>
        <Typography variant="body1" color="textSecondary">
          This page is used to enter the subtest information. Please fill in the title, code,
          duration, and choose the relevant series.
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={1} sx={{ px: 6 }}>
        <Grid size={{ xs: 6, md: 8 }}>
          <TextFieldCtrl
            control={control}
            name="subtest_name"
            label="Title"
            placeholder="Enter Subtest Title here ..."
            rules={{ required: "This field is required" }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <TextFieldCtrl
            control={control}
            name="subtest_code"
            label="Code"
            placeholder="Enter Subtest Code here ..."
            rules={{ required: "This field is required" }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 12 }}>
          <TextFieldCtrl
            control={control}
            name="subtest_desc"
            label="Description"
            placeholder="Enter Subtest Description here ..."
            multiline
            rows={3}
            rules={{ required: "This field is required" }}
          />
        </Grid>
        {enableDuration && (
          <Grid size={{ xs: 6, md: 6 }}>
            <TimePickerCtrl
              control={control}
              name="subtest_duration"
              label="Duration"
              rules={{ required: "This field is required" }}
            />
          </Grid>
        )}
      </Grid>
      <Grid size={{ xs: 6, md: 4 }} sx={{ px: 6, mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CustomSwitch
            value={enableDuration}
            onChange={(checked: boolean) => setEnableDuration(checked)}
          />
          <Typography variant="body2" color="textSecondary">
            Enable Duration for this subtest
          </Typography>
        </Box>
      </Grid>
      <Box sx={{ px: 6, mt: 2 }}>
        <MaterialReactTable table={table} />
      </Box>

      <DialogComp title="Preview Question" open={isOpen} onClose={close} maxWidth="md">
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
export default Subtest;
