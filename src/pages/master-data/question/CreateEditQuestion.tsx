import AnswerField from "@/components/AnswerField";
import DialogComp from "@/components/Dialog";
import FileInput from "@/components/forms/FileInput";
import RTEField from "@/components/forms/RTEField";
import SelectCtrl from "@/components/forms/Select";
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
  language_id: string;
  language_type: string;
  answer: AnswerValues[];
}

const CreateEditQuestion = ({
  onSuccess,
  id: propId,
  formId = "question-form",
}: {
  onSuccess?: () => void;
  id?: string | null;
  formId?: string;
}) => {
  const { id: urlId } = useParams();
  const id = propId || urlId;
  const isEdit = Boolean(id);
  const API = useAPI();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const { data: question } = useFetch<any>(isEdit ? `/question/${id}` : null);
  const { data: categories } = useFetch<any>("/category");
  const { data: languages } = useFetch<any>("/languages");
  const { data: languagesWithStatus } = useFetch<any>(
    isEdit && id ? `/languages/question/${id}` : null
  );
  const user_id = useAuthStore(state => state.user_id);
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
  } = useForm<QuestionValues, any>({
    defaultValues: {
      q_input_text: "",
      q_input_image: null,
      answer_type: "",
      category_id: 0,
      language_id: "",
      language_type: "main",
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
        // {
        //   text: "",
        //   image: null,
        //   point: 0,
        // },
        // {
        //   text: "",
        //   image: null,
        //   point: 0,
        // },
      ],
    },
  });

  const questionImage = watch("q_input_image");
  const questionImageUrl = watch("q_input_image_url");
  const languageType = watch("language_type");
  const selectedLanguageId = watch("language_id");

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (id && question) {
        const data = question.data;
        console.log("Fetched data:", data);

        const getImageBlob = async (url: string) => {
          try {
            // Ubah path agar sesuai dengan yang digunakan di komponen lain
            const res = await API.get(`${import.meta.env.VITE_API_URL}/static/question/${url}`, {
              responseType: "blob",
            });
            const imageData = res.data;
            const filename = url.split("/").pop() || "default_filename";
            const metadata = { type: "image/*" };
            return new File([imageData], filename, metadata);
          } catch (error) {
            console.error("Error fetching image:", error);
            return null; // Return null jika gambar tidak ditemukan
          }
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
          category_id: data.category_id,
          language_id: data.language_id || "",
          answer: answersWithFiles,
        });
        console.log("Setting form values:", {
          answer_type: data.answer_type,
          category_id: data.category_id,
        });
      }
    };

    // Call the async function
    fetchAndSetData().catch(console.error);
  }, [id, question]);

  // Effect to fetch translation data when sub-language is selected
  useEffect(() => {
    const fetchTranslationData = async () => {
      if (isEdit && id && languageType === "sub" && selectedLanguageId) {
        try {
          const response = await API.get(`/question/${id}/translation/${selectedLanguageId}`);
          const translationData = response.data.data;

          // Populate form with translation data
          setValue("q_input_text", translationData.q_input_text || "");

          // Populate answer texts (keeping images from main question)
          const currentAnswers = getValues("answer");
          const updatedAnswers = currentAnswers.map((answer: any, index: number) => ({
            ...answer,
            text: translationData.answers[index]?.text || "",
          }));

          setValue("answer", updatedAnswers);
        } catch (error) {
          console.log("No translation found or error fetching translation data:", error);
          // If no translation exists, reset text fields to empty for new translation
          setValue("q_input_text", "");
          const currentAnswers = getValues("answer");
          const clearedAnswers = currentAnswers.map((answer: any) => ({
            ...answer,
            text: "",
          }));
          setValue("answer", clearedAnswers);
        }
      }
    };

    fetchTranslationData();
  }, [isEdit, id, languageType, selectedLanguageId, setValue, getValues]);

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

  const languageTypeOptions = [
    {
      name: "Main Language",
      value: "main",
    },
    {
      name: "Sub Language (Translation)",
      value: "sub",
    },
  ];

  // Get the appropriate language options based on context
  const getLanguageOptions = () => {
    let availableLanguages = [];

    if (isEdit && languagesWithStatus?.data) {
      availableLanguages = languagesWithStatus.data;
    } else {
      availableLanguages = languages?.data || [];
    }

    if (isEdit && languagesWithStatus?.data && languageType) {
      if (languageType === "sub") {
        // If language_type is "sub", filter out the main language
        const mainLanguage = languagesWithStatus.data.find(
          (lang: any) => lang.translation_status === "main"
        );

        if (mainLanguage) {
          // Filter out the main language from options
          availableLanguages = availableLanguages.filter(
            (lang: any) => lang.language_code !== mainLanguage.language_code
          );
        }
      } else if (languageType === "main") {
        // If language_type is "main", only show languages that don't have translations yet
        // and the current main language
        availableLanguages = availableLanguages.filter(
          (lang: any) =>
            lang.translation_status === "main" ||
            lang.translation_status === "translation_available"
        );
      }
    }

    return availableLanguages;
  };

  // Get color styling for language options based on translation status
  const getLanguageOptionStyle = (language: any) => {
    if (!isEdit) return {};

    switch (language.translation_status) {
      case "main":
        return { backgroundColor: "#e3f2fd", color: "#1976d2" }; // Blue for main
      case "translation_exists":
        return { backgroundColor: "#e3f2fd", color: "#1976d2" }; // Blue for existing translation
      case "translation_available":
        return {}; // White/default for available translation
      default:
        return {};
    }
  };

  const removeQuestionImage = () => {
    setValue("q_input_image", null);
    setValue("q_input_image_url", null);
  };

  const onSubmit = async (values: QuestionValues) => {
    console.log(values);
    showLoading();

    const formData = new FormData();
    // Append primitive and non-file properties
    formData.append(isEdit ? "updated_by" : "created_by", user_id);
    formData.append("category_id", values.category_id.toString());
    formData.append("q_input_text", values.q_input_text ? values.q_input_text : "");
    formData.append("answer_type", values.answer_type);
    formData.append("language_id", values.language_id);
    if (isEdit) {
      formData.append("language_type", values.language_type);
    }

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
      console.log(res);
      if (onSuccess) {
        onSuccess();
      }
      snack.success(`Question successfully ${isEdit ? "edited" : "created"}`);
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
      id={formId}
      onSubmit={handleSubmit(async () => {
        const valid = await trigger();
        if (valid) open();
      })}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <SelectCtrl
            name="answer_type"
            label="Answer Type"
            control={control}
            rules={{
              required: "Field required",
            }}
          >
            {answerType.map(data => (
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

          {isEdit && (
            <SelectCtrl
              name="language_type"
              label="Language Type"
              control={control}
              rules={{
                required: "Field required",
              }}
            >
              {languageTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.name}
                </MenuItem>
              ))}
            </SelectCtrl>
          )}

          <SelectCtrl
            name="language_id"
            label="Language"
            control={control}
            rules={{
              required: "Field required",
            }}
          >
            {/* Show loading state while fetching language data */}
            {(isEdit && languagesWithStatus?.loading) || (!isEdit && languages?.loading) ? (
              <MenuItem disabled>Loading languages...</MenuItem>
            ) : getLanguageOptions().length === 0 ? (
              <MenuItem disabled>No languages available</MenuItem>
            ) : (
              getLanguageOptions().map((language: any) => (
                <MenuItem
                  key={language.id}
                  value={language.language_code}
                  sx={getLanguageOptionStyle(language)}
                >
                  {language.language_name} ({language.language_code})
                  {isEdit && language.translation_status === "main" && " - Main"}
                  {isEdit &&
                    language.translation_status === "translation_exists" &&
                    " - Has Translation"}
                </MenuItem>
              ))
            )}
          </SelectCtrl>
        </Box>

        <Card raised>
          <CardContent>
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* take image url if not empty */}
              {(questionImageUrl || questionImage) && (
                <Box
                  sx={{
                    position: "relative",
                    height: 300,
                  }}
                >
                  <img
                    src={
                      questionImageUrl
                        ? `${import.meta.env.VITE_API_URL}/static/question/${questionImageUrl}`
                        : (questionImage && URL.createObjectURL(questionImage)) || ""
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  <IconButton
                    sx={{ position: "absolute", top: -10, left: 0 }}
                    onClick={removeQuestionImage}
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>
              )}
              <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
                <RTEField
                  control={control}
                  placeholder="Question"
                  name="q_input_text"
                  sx={{ height: "auto" }}
                  // minRows={8}
                  // multiline
                  // noMargin
                  // textAlign="center"
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
              </Box>
            </Box>
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
    </form>
  );
};
export default CreateEditQuestion;
