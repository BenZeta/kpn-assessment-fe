import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Show } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import React, { useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { FaEdit, FaQuestionCircle, FaRegCheckSquare } from "react-icons/fa";
import CustomSwitch from "../CustomSwitch";

type QuestionCardProps = {
  questionData?: {
    id: string;
    q_input_text: string;
    answer_type: string;
    answers: Array<{
      text: string;
      image_url: string | null;
      point: string;
    }>;
  };
};

const QuestionCard: React.FC<QuestionCardProps> = ({ questionData }) => {
  const { control, register } = useForm({
    defaultValues: {
      question: questionData?.q_input_text || "",
      answer_type: questionData?.answer_type || "",
      answers: questionData?.answers.map((answer) => {
        text: answer.text;
        correct: answer.point > "0";
      }) || [{ text: "", correct: false }],
      point: "",
    },
  });
  const {} = useFieldArray({
    control,
    name: "answers",
  });
  const [questionType, setQuestionType] = useState("multiple-choice");

  return (
    <Show
      title={
        <Box display="flex" alignItems="center" gap="10px">
          <Typography fontWeight="600">Question Type</Typography>
          <Select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            size="small"
            sx={{
              minWidth: 180,
              minHeight: 20,
              backgroundColor: "white",
              borderRadius: 1,
              "& .MuiSelect-select": {
                padding: "0",
              },
            }}
          >
            <MenuItem value="multiple-choice">
              <ListItem sx={{ display: "flex", alignItems: "center" }}>
                <ListItemIcon
                  children={<FaRegCheckSquare />}
                  sx={{ minWidth: "36px" }}
                />
                <ListItemText primary="Multiple Choice" />
              </ListItem>
            </MenuItem>
            <MenuItem value="short-answer">
              <ListItem sx={{ display: "flex", alignItems: "center" }}>
                <ListItemIcon children={<FaEdit />} sx={{ minWidth: "36px" }} />
                <ListItemText primary="Short Answer" />
              </ListItem>
            </MenuItem>
            <MenuItem value="true-false">
              <ListItem sx={{ display: "flex", alignItems: "center" }}>
                <ListItemIcon
                  children={<FaQuestionCircle />}
                  sx={{ minWidth: "36px" }}
                />
                <ListItemText primary="True/False" />
              </ListItem>
            </MenuItem>
          </Select>
        </Box>
      }
      headerProps={{ sx: { backgroundColor: "#E5E7EB" } }}
      goBack
      footerButtons
      headerButtons
    >
      <Typography>Question</Typography>
      <TextField
        {...register("question")}
        variant="outlined"
        size="small"
        fullWidth
        multiline
        disabled={true}
        rows={4}
        value={questionData?.q_input_text}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mt: 2 }}>
        <Typography>
          Answer<span style={{ color: "red" }}> *</span>
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Typography>Multiple answer</Typography>
        <CustomSwitch />
        <Typography>Answer with image</Typography>
        <CustomSwitch />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        {questionData?.answers.map((answer, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <TextField
              {...register(`answers.${index}.text`)}
              variant="outlined"
              size="small"
              disabled={true}
              label={`Answer ${index + 1}`}
              sx={{ flexGrow: 1 }}
              value={answer.text}
            />
            <Controller
              name={`answers.${index}.correct`}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox {...field} checked={answer.point !== "0"} />
                  }
                  label="Correct"
                />
              )}
            />
          </Box>
        ))}
      </Box>
    </Show>
  );
};
export default QuestionCard;
