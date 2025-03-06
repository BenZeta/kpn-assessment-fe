import AnswerField from "@/components/AnswerField";
import DialogComp from "@/components/Dialog";
import FileInput from "@/components/forms/FileInput";
import SelectCtrl from "@/components/forms/Select";
import TextFieldCtrl from "@/components/forms/TextField";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { AnswerProps } from "@/types/MasterData";
import ClearIcon from "@mui/icons-material/Clear";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  Typography,
} from "@mui/material";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

export interface AnswerValues {
  text?: string;
  image?: File | null;
  image_url?: string | null;
  point: number;
}

interface QuestionValues {
  q_input_text?: string;
  category_id: number;
  q_input_image?: File | null;
  q_input_image_url?: string | null;
  answer_type: string;
  answer: AnswerValues[];
}

const CreateEditQuestion = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const API = useAPI();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const { data: question } = useFetch<any>(isEdit ? `/question/${id}` : null);
  const { data: categories } = useFetch<any>("/category");
  const { data: categories } = useFetch<any>("/category");
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
          const res = await API.get(
            `${import.meta.env.VITE_API_URL}/static/${url}`,
            {
              responseType: "blob",
            }
          );
          const res = await API.get(
            `${import.meta.env.VITE_API_URL}/static/${url}`,
            {
              responseType: "blob",
            }
          );
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
    formData.append("category_id", values.category_id.toString());
    formData.append(
      "q_input_text",
      values.q_input_text ? values.q_input_text : ""
    );
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
      console.log("data: ", formData);
      console.log("data: ", formData);
      console.log(res);
      if (onSuccess) {
        onSuccess();
      }
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
      close();
    }
  };

  return (
    <form
      id="question-form"
      onSubmit={handleSubmit(async () => {
        const valid = await trigger();
        if (valid) open();
      })}
    >
      <Container maxWidth="lg">
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
          <SelectCtrl name="category_id" label="Category" control={control}>
            {categories?.data.map((data: any) => (
              <MenuItem key={data.id} value={data.id}>
                {data.category_name}
              </MenuItem>
            ))}
          </SelectCtrl>
          <SelectCtrl name="category_id" label="Category" control={control}>
            {categories?.data.map((data: any) => (
              <MenuItem key={data.id} value={data.id}>
                {data.category_name}
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
                        ? `${
                            import.meta.env.VITE_API_URL
                          }/static/question/${questionImageUrl}`
                        : (questionImage &&
                            URL.createObjectURL(questionImage)) ||
                          ""
                        ? `${
                            import.meta.env.VITE_API_URL
                          }/static/question/${questionImageUrl}`
                        : (questionImage &&
                            URL.createObjectURL(questionImage)) ||
                          ""
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
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
                size={{
                  xs: 12,
                  sm: questionImage || questionImageUrl ? 8 : 12,
                }}
                size={{
                  xs: 12,
                  sm: questionImage || questionImageUrl ? 8 : 12,
                }}
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
            <AnswerField
              control={control}
              setValue={setValue}
              getValues={getValues}
              id={id}
            />
            <AnswerField
              control={control}
              setValue={setValue}
              getValues={getValues}
              id={id}
            />
          </CardActions>
        </Card>
        {errors.answer?.root && (
          <Typography color="error" mt={4} mx={2}>
            {errors.answer.root.message}
          </Typography>
        )}
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
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              color="error"
            >
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              color="error"
            >
              {isEdit ? `Edit` : "Create"}
            </Button>
          </>
        }
      >
        <Typography>{`Are you sure you want to ${
          isEdit ? "edit this" : "create"
        } question?`}</Typography>
      </DialogComp>
    </form>
    </form>
  );
};
export default CreateEditQuestion;
