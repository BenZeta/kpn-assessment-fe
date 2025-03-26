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
import { useState, useEffect, FC } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { FaEdit, FaQuestionCircle, FaRegCheckSquare } from "react-icons/fa";
import TextFieldCtrl from "../forms/TextField";
import ImageCont from "@/components/common/ImageCont";

export type QuestionData = {
  id: string;
  q_input_text: string;
  q_input_image_url: string;
  answer_type: string;
  category_name: string;
  answers: Array<{
    text: string;
    image_url: string | null;
    point: string;
  }>;
};

type QuestionCardProps = {
  questionData: QuestionData | null;
  disabled?: boolean;
};

const QuestionCard: FC<QuestionCardProps> = ({ questionData, disabled = true }) => {
  const { control, register, reset } = useForm<QuestionCardProps>({
    defaultValues: {
      question: "",
      answer_type: "",
      category_name: "",
      answers: [{ text: "", point: "0", image_url: null }],
      point: "",
    },
  });
  const {} = useFieldArray({
    control,
    name: "answers",
  });
  const [questionType, setQuestionType] = useState("multiple-choice");

  useEffect(() => {
    if (!questionData) return;
    reset({
      question: questionData?.q_input_text,
      answer_type: questionData?.answer_type,
      category_name: questionData?.category_name,
      answers: questionData?.answers.map(answer => ({
        text: answer.text,
        point: answer.point,
        image_url: answer.image_url,
      })),
      point: "",
    });
  }, [questionData]);

  return (
    <Show
      title={
        <Box display="flex" alignItems="center" gap="8px">
          <Typography fontWeight="600">Question Type:</Typography>
          <Select
            value={questionType}
            onChange={e => setQuestionType(e.target.value)}
            size="small"
            sx={{
              backgroundColor: "white",
              "& .MuiSelect-select": {
                padding: "0",
              },
            }}
          >
            <MenuItem value="multiple-choice" sx={{ padding: "4px" }}>
              <ListItem
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 8px",
                }}
              >
                <ListItemIcon children={<FaRegCheckSquare />} sx={{ minWidth: "8px", mr: "6px" }} />
                <ListItemText primary="Multiple Choice" />
              </ListItem>
            </MenuItem>
            <MenuItem value="short-answer" sx={{ padding: "4px" }}>
              <ListItem sx={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
                <ListItemIcon children={<FaEdit />} sx={{ minWidth: "8px", mr: "6px" }} />
                <ListItemText primary="Short Answer" />
              </ListItem>
            </MenuItem>
            <MenuItem value="true-false" sx={{ padding: "4px" }}>
              <ListItem sx={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
                <ListItemIcon
                  children={<FaQuestionCircle />}
                  sx={{ minWidth: "8px", border: "1px solid blue", mr: "6px" }}
                />
                <ListItemText primary="True/False" />
              </ListItem>
            </MenuItem>
          </Select>
          <Typography fontWeight="600">Category:</Typography>
          <Controller
            name="category_name"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={questionData?.category_name || ""} // Set value to category_name
                disabled={disabled}
                size="small"
                sx={{
                  backgroundColor: "white",
                  "& .MuiSelect-select": {
                    padding: "0",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "white",
                    color: "text.primary",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                  },
                }}
              >
                <MenuItem value={questionData?.category_name || ""} sx={{ padding: "4px" }}>
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 8px",
                    }}
                  >
                    <ListItemText primary={questionData?.category_name || "No Category"} />
                  </ListItem>
                </MenuItem>
              </Select>
            )}
          />
        </Box>
      }
      headerProps={{ sx: { backgroundColor: "#E5E7EB" } }}
      goBack
      footerButtons
      headerButtons
    >
      <Typography>Question</Typography>
      {questionData?.q_input_image_url && (
        <>
          <img
            src={`${import.meta.env.VITE_API_URL}/static/question/${
              questionData?.q_input_image_url
            }`}
            style={{ width: "20rem" }}
          />
        </>
      )}
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
        {/* <CustomSwitch /> */}
        <Typography>Answer with image</Typography>
        {/* <CustomSwitch /> */}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        {questionData?.answers.map((answer, index) => {
          return (
            <Box key={index} sx={{ display: "flex", alignContent: "center", gap: 1 }}>
              {answer.image_url ? (
                <ImageCont control={control} name={`answers.${index}.image_url`} />
              ) : (
                <TextField
                  {...register(`answers.${index}.text`)}
                  variant="outlined"
                  size="small"
                  disabled={true}
                  label={`Answer ${index + 1}`}
                  value={answer.text}
                />
              )}
              <TextFieldCtrl
                control={control}
                name={`answers.${index}.point`}
                label="Points"
                size="small"
                sx={{ width: "4rem" }}
              />
            </Box>
          );
        })}
      </Box>
    </Show>
  );
};
export default QuestionCard;
