import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import React, { useState } from "react";
import { BsPatchQuestionFill } from "react-icons/bs";
import {
  FaArrowDown,
  FaArrowUp,
  FaEdit,
  FaQuestionCircle,
  FaRegCheckSquare,
} from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import CustomSwitch from "../CustomSwitch";
import TextFieldCtrl from "../forms/TextField";
import QuestionCard from "./QuestionCard";

type QuestionLayoutProps = {
  title?: string;
};

const QuestionLayout: React.FC<QuestionLayoutProps> = ({ title }) => {
  const {
    refineCore: { formLoading },
    control,
    reset,
    watch,
    setValue,
    // formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      question: "",
      question_type: "",
      answer: "",
      point: "",
    },
  });
  const [questionType, setQuestionType] = useState("multiple-choice");

  return (
    <Create
      title={
        <Typography variant="h6" fontWeight="600">
          Judul Category
        </Typography>
      }
      headerButtons={({ defaultButtons }) => {
        return (
          <>
            {defaultButtons}
            <Button startIcon={<MdOutlineRemoveRedEye />}>Preview</Button>
          </>
        );
      }}
      headerProps={{ sx: {} }}
      goBack={<BsPatchQuestionFill />}
      footerButtons={({}) => {
        return (
          <Button
            variant="outlined"
            color="primary"
            sx={{ display: "flex", justifyContent: "flex-start" }}
            startIcon={<IoMdAdd />}
          >
            Add new question
          </Button>
        );
      }}
    >
      <QuestionCard disabled={false} />
    </Create>
  );
};
export default QuestionLayout;
