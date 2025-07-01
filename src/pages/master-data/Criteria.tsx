import CriteriaDialog from "@/components/CriteriaDialog";
import { BoxSkeleton } from "@/components/Skeleton";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import DialogComp from "@/components/Dialog";
import { CategoryValues, CriteriaType } from "@/types/MasterData";
import { isAxiosError } from "axios";

const Criteria: React.FC = () => {
  const API = useAPI();
  const user_id: string = useAuthStore(s => s.user_id);
  const getPermission = useAuthStore(s => s.getPermission);
  const { showLoading, hideLoading } = useLoading();

  // fetch existing categories + color palette
  const { data: criteria, refetch } = useFetch<any>("/criteria");
  const { data: colorsResp } = useFetch<any>("/criteria/color");
  const colors = colorsResp?.data || [];

  // react-hook-form setup
  const {
    control,
    reset,
    handleSubmit,
    watch,
    getValues,
    formState: { isDirty },
  } = useForm<CategoryValues>({
    defaultValues: {
      value_name: "",
      value_code: "",
      created_by: user_id,
      standardized: [],
      criteria: [
        {
          criteria_name: "",
          description: "",
          color_id: "",
          minimum_score: 0,
          maximum_score: 10,
          is_active: true,
        },
      ],
    },
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({
    name: "criteria",
    control,
  });
  const {
    fields: standardizedFields,
    append: appendStandardized,
    remove: removeStandardized,
  } = useFieldArray({
    name: "standardized",
    control,
  });

  // dialog state
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<{ id: string; name: string }>({ id: "", name: "" });
  const { isOpen: openForm, open: handleOpenForm, close: handleCloseForm } = useDialog();
  const { isOpen: openDelete, open: handleOpenDelete, close: handleCloseDelete } = useDialog();
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  // open “create” or “edit” dialog
  const onOpenForm = (data?: CategoryValues, id?: string) => {
    if (data && id) {
      setIsEdit(true);
      setSelected({ id, name: data.value_name });
      reset({ ...data }, { keepDefaultValues: true, keepDirty: true });
    } else {
      setIsEdit(false);
      reset();
    }
    handleOpenForm();
  };

  // delete logic
  const onDelete = async (id: string) => {
    showLoading();
    try {
      await API.delete(`/criteria/${id}`);
      snack.success("Category deleted");
      refetch();
    } catch (err) {
      snack.error(isAxiosError(err) ? err.response?.data?.message : "Unknown error");
    } finally {
      hideLoading();
      handleCloseDelete();
    }
  };

  // create / edit
  const onCreate = async (vals: CategoryValues) => {
    showLoading();
    try {
      const payload = {
        ...vals,
        standardized: vals.standardized || [],
      };
      await API.post("/criteria", payload);
      snack.success("Category created");
      refetch();
    } catch (err) {
      snack.error(isAxiosError(err) ? err.response?.data?.message : "Unknown error");
    } finally {
      hideLoading();
      handleCloseForm();
    }
  };
  const onEdit = async (vals: CategoryValues) => {
    showLoading();
    try {
      const { value_id, ...restVals } = vals;
      const payload = {
        ...restVals,
        criteria: vals.criteria.map(({ color_name, hex_code, ...rest }) => rest),
        standardized: vals.standardized || [],
        user_id,
      };
      await API.patch(`/criteria/${selected.id}`, payload);
      snack.success("Category updated");
      refetch();
    } catch (err) {
      snack.error(isAxiosError(err) ? err.response?.data?.message : "Unknown error");
    } finally {
      hideLoading();
      handleCloseForm();
    }
  };

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, expanded: boolean) => {
    setExpandedAccordion(expanded ? panel : false);
  };

  if (!criteria) return <BoxSkeleton />;

  return (
    <>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h1" color="primary" fontWeight="bold" sx={{ mb: 0 }}>
          Criteria
        </Typography>
        {getPermission("fcreate", 5) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => onOpenForm()}>
            Create New Category
          </Button>
        )}
      </Box>

      {/* Accordion List */}
      {criteria.data.map((cat: any, idx: number) => (
        <Accordion
          key={cat.value_id}
          expanded={expandedAccordion === `panel${idx}`}
          onChange={handleAccordionChange(`panel${idx}`)}
          sx={{ mb: 2, boxShadow: 2, borderRadius: 2, "&:before": { display: "none" } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "grey.50",
              "& .MuiAccordionSummary-content": { alignItems: "center" },
            }}
          >
            <Box flex={1} display="flex" alignItems="center">
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 0 }}>
                {cat.value_name} ({cat.value_code})
              </Typography>
              <Chip label={`${cat.criteria.length} criteria`} size="small" sx={{ ml: 2 }} />
            </Box>
            <Box onClick={e => e.stopPropagation()}>
              {getPermission("fupdate", 5) && (
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onOpenForm(cat, cat.value_id)}
                >
                  Edit
                </Button>
              )}
              {getPermission("fdelete", 5) && (
                <IconButton
                  color="error"
                  onClick={() => {
                    setSelected({ id: cat.value_id, name: cat.value_name });
                    handleOpenDelete();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Criteria</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Min</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Max</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Color</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Description</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cat.criteria.map((c: CriteriaType, i: number) => {
                    const col = colors.find((x: any) => x.id === c.color_id);
                    return (
                      <TableRow key={i}>
                        <TableCell>{c.criteria_name}</TableCell>
                        <TableCell align="center">{c.minimum_score}</TableCell>
                        <TableCell align="center">{c.maximum_score}</TableCell>
                        <TableCell align="center">
                          <Box
                            component="span"
                            sx={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              bgcolor: col?.hex_code || "#ccc",
                            }}
                          />
                          <Typography variant="caption" ml={1}>
                            {col?.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{c.description}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {cat.standardized?.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Raw Score</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Standardized Score</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cat.standardized.map(
                      (s: { raw_score: number; standardized_score: number }, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{s.raw_score}</TableCell>
                          <TableCell>{s.standardized_score}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <CriteriaDialog
        isOpen={openForm}
        isEdit={isEdit}
        onClose={handleCloseForm}
        onSubmit={isEdit ? handleSubmit(onEdit) : handleSubmit(onCreate)}
        control={control}
        fields={fields}
        append={append}
        remove={remove}
        watch={watch}
        getValues={getValues}
        isDirty={isDirty}
        colors={colors}
        standardizedFields={standardizedFields}
        appendStandardized={appendStandardized}
        removeStandardized={removeStandardized}
      />

      {/* Delete Confirmation */}
      <DialogComp
        title="Delete Category"
        open={openDelete}
        onClose={handleCloseDelete}
        actions={
          <>
            <Button onClick={handleCloseDelete} variant="outlined">
              Cancel
            </Button>
            <Button onClick={() => onDelete(selected.id)} variant="contained" color="error">
              Delete
            </Button>
          </>
        }
      >
        Are you sure you want to remove <strong>{selected.name}</strong>?
      </DialogComp>
    </>
  );
};

export default Criteria;
