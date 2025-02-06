import FileInput from "@/components/forms/FileInput";
import TextFieldCtrl from "@/components/forms/TextField";
import {
  Grid2 as Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  CardActions,
  MenuItem,
  Container,
} from "@mui/material";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import ClearIcon from "@mui/icons-material/Clear";
import { useForm } from "react-hook-form";
import useAPI from "@/hooks/useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import { useLoading } from "@/providers/LoadingProvider";
import useAuthStore from "@/hooks/useAuthStore";
import SelectCtrl from "@/components/forms/Select";
import { useNavigate, useParams } from "react-router-dom";
import DialogComp from "@/components/Dialog";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useEffect } from "react";
import AnswerField from "@/components/AnswerField";
import { AnswerProps } from "@/types/MasterData";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export interface AnswerValues {
  text?: string;
  image?: File | null;
  image_url?: string | null;
  point: number;
}

interface QuestionValues {
  q_seq: number;
  q_layout_type: string;
  q_input_text?: string;
  q_input_image?: File | null;
  q_input_image_url?: string | null;
  answer_type: string;
  answer: AnswerValues[];
}

const CreateEditQuestion = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const API = useAPI();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const { data: question } = useFetch<any>(isEdit ? `/question/${id}` : null);
  const user_id = useAuthStore((state) => state.user_id);
  const { isOpen, open, close } = useDialog();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    getValues,
    trigger,
    reset,
  } = useForm<QuestionValues>({
    defaultValues: {
      q_seq: 0,
      q_layout_type: "",
      q_input_text: "",
      q_input_image: null,
      answer_type: "",
      answer: [
        {
          text: "",
          image: null,
          point: 0,
        },
        {
          text: "",
          image: null,
          point: 0,
        },
        {
          text: "",
          image: null,
          point: 0,
        },
        {
          text: "",
          image: null,
          point: 0,
        },
      ],
    },
  });

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (id && question) {
        const data = question.data;

        const getImageBlob = async (url: string) => {
          const res = await API.get(`${import.meta.env.VITE_API_URL}/static/question/${url}`, {
            responseType: "blob",
          });
          const imageData = res.data;
          const filename = url.split("/").pop() || "default_filename";
          const metadata = { type: "image/*" };
          return new File([imageData], filename, metadata);
        };

        const answersWithFiles = await Promise.all(
          data.answers.map(async (answer: AnswerProps) => {
            if (answer.image_url) {
              const file = await getImageBlob(answer.image_url);
              return { ...answer, image: file };
            }
            return answer;
          })
        );

        let qImage = null;
        if (data.question.input_image_url)
          qImage = await getImageBlob(data.question.input_image_url);

        reset({
          q_seq: data.question.seq,
          q_layout_type: data.question.layout_type,
          q_input_text: data.question.input_text,
          q_input_image: qImage,
          q_input_image_url: data.question.input_image_url,
          answer_type: data.answer_type,
          answer: answersWithFiles,
        });
      }
    };

    // Call the async function
    fetchAndSetData().catch(console.error);
  }, [id, question]);

  const questionImage = watch("q_input_image");
  const questionImageUrl = watch("q_input_image_url");

  const answerType = [
    {
      name: "Single Answer",
      value: "single",
    },
    {
      name: "Multiple Answer",
      value: "multiple",
    },
  ];

  const removeQuestionImage = () => {
    setValue("q_input_image", null);
    setValue("q_input_image_url", null);
  };

  const onSubmit = async (values: QuestionValues) => {
    console.log(values);
    showLoading();

    const formData = new FormData();
    // Append primitive and non-file properties
    formData.append("created_by", user_id);
    formData.append("category_id", 9);
    formData.append("q_seq", values.q_seq.toString());
    formData.append("q_layout_type", values.q_layout_type);
    formData.append("q_input_text", values.q_input_text ? values.q_input_text : "");
    formData.append("answer_type", values.answer_type);

    // Append the file for `q_input_image`
    if (values.q_input_image) {
      formData.append("q_input_image", values.q_input_image);
    }

    // Serialize and append the `answer` array
    values.answer.forEach((ans, index) => {
      if (ans.text) {
        formData.append(`answer[${index}][text]`, ans.text);
      }
      if (ans.image) {
        formData.append(`answer[${index}][image]`, ans.image);
      }
      formData.append(`answer[${index}][point]`, ans.point.toString());
    });

    try {
      const res = isEdit
        ? await API.patch(`/question/${id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
        : await API.post(`/question`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
      console.log(res);
      snack.success(`${res.data.message}`);
      navigate("/admin/question");
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data.message);
        console.error(error.response);
      } else {
        snack.error("Error, check log for details");
        console.error(error);
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2" color="primary" mb={0}>
            {isEdit ? `Edit` : "New"} Question
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <SelectCtrl
            name="answer_type"
            label="Answer Type"
            control={control}
            rules={{
              required: "Field required",
            }}
          >
            {answerType.map((data) => (
              <MenuItem key={data.value} value={data.value}>
                {data.name}
              </MenuItem>
            ))}
          </SelectCtrl>
        </Box>

        <Card raised>
          <CardContent>
            <Grid container spacing={2} alignItems="end">
              {(isEdit ? questionImageUrl : questionImage) && (
                <Grid
                  size={{ xs: 12, sm: 4 }}
                  sx={{
                    display: "flex",
                    position: "relative",
                    height: 300,
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={
                      isEdit
                        ? `${import.meta.env.VITE_API_URL}/static/question/${questionImageUrl}`
                        : (questionImage && URL.createObjectURL(questionImage)) || ""
                    }
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                  <IconButton
                    sx={{ position: "absolute", top: 0, left: 0 }}
                    onClick={removeQuestionImage}
                  >
                    <ClearIcon />
                  </IconButton>
                </Grid>
              )}
              <Grid
                size={{ xs: 12, sm: questionImage || questionImageUrl ? 8 : 12 }}
                sx={{ position: "relative" }}
              >
                <TextFieldCtrl
                  control={control}
                  placeholder="Question"
                  name="q_input_text"
                  minRows={8}
                  multiline
                  noMargin
                  textAlign="center"
                />
                {!questionImage && !questionImageUrl && (
                  <FileInput
                    floating
                    control={control}
                    name="q_input_image"
                    text="Add Question Image"
                    fullWidth
                    icon={<InsertPhotoIcon />}
                    accept="image/*"
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <AnswerField control={control} setValue={setValue} getValues={getValues} id={id} />
          </CardActions>
        </Card>
        {errors.answer?.root && (
          <Typography color="error" mt={4} mx={2}>
            {errors.answer.root.message}
          </Typography>
        )}
        <Box textAlign="right" mt={4}>
          <Button
            variant="contained"
            onClick={async () => {
              const valid = await trigger();
              if (valid) open();
            }}
          >
            Save
          </Button>
        </Box>
      </Container>

      <DialogComp
        title={isEdit ? `Edit Question` : "Create Question"}
        open={isOpen}
        onClose={close}
        actions={
          <>
            <Button onClick={close} variant="outlined" color="error">
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} variant="contained" color="error">
              {isEdit ? `Edit` : "Create"}
            </Button>
          </>
        }
      >
        <Typography>{`Are you sure you want to ${
          isEdit ? "edit this" : "create"
        } question?`}</Typography>
      </DialogComp>
    </>
  );
};
export default CreateEditQuestion;
