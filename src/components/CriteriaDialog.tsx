import DialogComp from "@/components/Dialog";
import NumericFieldCtrl from "@/components/forms/NumericField";
import SelectCtrl from "@/components/forms/Select";
import TextFieldCtrl from "@/components/forms/TextField";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Tab,
    Tabs,
} from "@mui/material";
import React, { useState } from "react";

type CriteriaDialogProps = {
  isOpen: boolean;
  isEdit: boolean;
  onClose: () => void;
  onSubmit: () => void;
  control: any;
  fields: any[];
  append: (v: any) => void;
  remove: (index: number) => void;
  watch: any;
  getValues: any;
  isDirty: boolean;
  colors: { id: string; name: string; hex_code: string }[];
};

const CriteriaDialog: React.FC<CriteriaDialogProps> = ({
  isOpen,
  isEdit,
  onClose,
  onSubmit,
  control,
  fields,
  append,
  remove,
  watch,
  getValues,
  isDirty,
  colors,
}) => {
  const [tab, setTab] = useState(0);

  return (
    <DialogComp
      maxWidth="md"
      title={!isEdit ? "Create New Category" : "Edit Category"}
      open={isOpen}
      onClose={onClose}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        <Tab label="Category Info" />
        <Tab label={`Criteria (${fields.length})`} />
      </Tabs>

      {tab === 0 && (
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextFieldCtrl
                control={control}
                name="value_name"
                label="Category Name"
                rules={{
                  required: "Field required",
                  maxLength: { value: 255, message: "Max 255 characters allowed" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextFieldCtrl
                control={control}
                name="value_code"
                label="Category Code"
                rules={{
                  required: "Field required",
                  maxLength: { value: 10, message: "Max 10 characters allowed" },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
      )}

      {tab === 1 && (
        <DialogContent dividers sx={{ maxHeight: 400, overflowY: "auto" }}>
          {fields.map((field, index) => (
            <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextFieldCtrl
                    control={control}
                    name={`criteria.${index}.criteria_name`}
                    label="Criteria Name"
                    rules={{
                      required: "Field required",
                      maxLength: { value: 50, message: "Max 50 characters allowed" },
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <NumericFieldCtrl
                    control={control}
                    name={`criteria.${index}.minimum_score`}
                    label="Min Score"
                    decimalScale={0}
                    min={0}
                    rules={{
                      required: "Field required",
                      validate: value =>
                        index > 0
                          ? Number(value) ===
                              Number(watch(`criteria.${index - 1}.maximum_score`)) + 1 ||
                            "Must +1 from prev max"
                          : true,
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <NumericFieldCtrl
                    control={control}
                    name={`criteria.${index}.maximum_score`}
                    label="Max Score"
                    decimalScale={0}
                    min={0}
                    rules={{
                      required: "Field required",
                      validate: value =>
                        Number(value) >= Number(watch(`criteria.${index}.minimum_score`)) ||
                        "Must >= min",
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <SelectCtrl
                    control={control}
                    name={`criteria.${index}.color_id`}
                    label="Color"
                    rules={{
                      validate: value => {
                        const selected: string[] = watch("criteria").map((c: { color_id: string }) => c.color_id);
                        return (
                          selected.filter((id: string) => id === value).length === 1 ||
                          "Color must be unique"
                        );
                      },
                    }}
                  >
                    {colors.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              bgcolor: c.hex_code,
                              border: "1px solid",
                              borderColor: "grey.300",
                            }}
                          />
                          {c.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </SelectCtrl>
                </Grid>
                <Grid item xs={12} md={2} sx={{ textAlign: "right" }}>
                  <IconButton
                    color="error"
                    disabled={index === 0}
                    onClick={() => remove(index)}
                    title="Remove criterion"
                  >
                    <DeleteIcon />
                  </IconButton>
                  {index === fields.length - 1 && (
                    <IconButton
                      color="primary"
                      onClick={() =>
                        append({
                          criteria_name: "",
                          description: "",
                          color_id: "",
                          minimum_score: Number(getValues(`criteria.${index}.maximum_score`)) + 1,
                          maximum_score: Number(getValues(`criteria.${index}.maximum_score`)) + 11,
                          is_active: true,
                        })
                      }
                      title="Add new criterion"
                    >
                      <AddIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <TextFieldCtrl
                  control={control}
                  name={`criteria.${index}.description`}
                  label="Description"
                  multiline
                  rows={2}
                  rules={{ required: "Field required" }}
                />
              </Box>
            </Paper>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              append({
                criteria_name: "",
                description: "",
                color_id: "",
                minimum_score: 0,
                maximum_score: 10,
                is_active: true,
              })
            }
          >
            Add Criterion
          </Button>
        </DialogContent>
      )}

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={!isDirty}>
          {!isEdit ? "Create" : "Save Changes"}
        </Button>
      </DialogActions>
    </DialogComp>
  );
};

export default CriteriaDialog;
