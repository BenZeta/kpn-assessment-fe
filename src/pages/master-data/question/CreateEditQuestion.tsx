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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

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
  onFormChange,
}: {
  onSuccess?: () => void;
  id?: string | null;
  formId?: string;
  onFormChange?: (hasChanges: boolean) => void;
}) => {
  const { id: urlId } = useParams();
  const id = propId || urlId;
  const isEdit = Boolean(id);
  const API = useAPI();
  const { showLoading, hideLoading } = useLoading();
  const { isOpen, open, close } = useDialog();
  const { data: question } = useFetch<any>(isEdit ? `/question/${id}` : null);
  const { data: categories } = useFetch<any>("/category");
  const { data: languages } = useFetch<any>("/languages");
  const { data: languagesWithStatus } = useFetch<any>(
    isEdit && id ? `/languages/question/${id}` : null
  );
  const user_id = useAuthStore(state => state.user_id);

  const [lastUnifiedLanguage, setLastUnifiedLanguage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [translationState, setTranslationState] = useState<{
    exists: boolean | null;
    isChecking: boolean;
    isGenerating: boolean;
  }>({
    exists: null,
    isChecking: false,
    isGenerating: false,
  });
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

  // Track if we're programmatically setting values to avoid false unsaved detection
  const [isProgrammaticallyUpdating, setIsProgrammaticallyUpdating] = useState(false);

  // Track form changes to detect unsaved changes
  useEffect(() => {
    if (!isEdit) return; // Only track changes in edit mode

    // Only mark as unsaved if user is actually editing (not when we're programmatically setting values)
    const subscription = watch((_, { name, type }) => {
      if (type === "change" && name && !isProgrammaticallyUpdating) {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isEdit, isProgrammaticallyUpdating]);

  // Reset unsaved changes on successful operations
  useEffect(() => {
    if (onFormChange) {
      onFormChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onFormChange]);

  // Effect to immediately reset translation state when language type changes
  useEffect(() => {
    setTranslationState({
      exists: null,
      isChecking: false,
      isGenerating: false,
    });
    // Reset unsaved changes when switching language type as this is navigation, not data editing
    setHasUnsavedChanges(false);
  }, [languageType]);

  useEffect(() => {
    if (isEdit && id && languageType && languagesWithStatus?.data) {
      setTranslationState(prev => ({
        ...prev,
        exists: null,
        isChecking: languageType === "sub",
      }));

      const handleLanguageTypeSwitch = async () => {
        try {
          setIsProgrammaticallyUpdating(true);
          const response = await API.get(
            `/translation/question/${id}/language-selection?languageType=${languageType}`
          );
          const data = response.data.data;

          setValue("language_id", data.language_code);
          setLastUnifiedLanguage(data.language_code);

          if (languageType === "sub") {
            setTranslationState(prev => ({
              ...prev,
              exists: data.has_translation,
              isChecking: false,
            }));

            if (data.has_translation && data.translation_data) {
              setValue("q_input_text", data.translation_data.q_input_text || "");

              const currentAnswers = getValues("answer");
              const updatedAnswers = currentAnswers.map((answer: any, index: number) => ({
                ...answer,
                text: data.translation_data.answers[index]?.text || "",
              }));
              setValue("answer", updatedAnswers);
            }
          } else {
            // For main language, reset translation state and reload main question data
            setTranslationState(prev => ({
              ...prev,
              exists: null,
              isChecking: false,
            }));

            // Re-fetch and populate main question data when switching back to main
            if (question?.data) {
              const mainData = question.data;
              setValue("q_input_text", mainData.question.input_text || "");

              const currentAnswers = getValues("answer");
              const updatedAnswers = currentAnswers.map((answer: any, index: number) => ({
                ...answer,
                text: mainData.answers[index]?.text || "",
              }));
              setValue("answer", updatedAnswers);
            }
          }
        } catch (error) {
          console.error("Error fetching language and translation:", error);
          setTranslationState(prev => ({
            ...prev,
            exists: null,
            isChecking: false,
          }));
        } finally {
          setIsProgrammaticallyUpdating(false);
        }
      };

      handleLanguageTypeSwitch();
    }
  }, [isEdit, id, languageType, languagesWithStatus?.data]);

  useEffect(() => {
    if (
      isEdit &&
      id &&
      languageType === "sub" &&
      selectedLanguageId &&
      selectedLanguageId !== "" &&
      selectedLanguageId !== lastUnifiedLanguage
    ) {
      setHasUnsavedChanges(false);

      setTranslationState(prev => ({
        ...prev,
        isChecking: true,
      }));

      const fetchTranslationForSelectedLanguage = async () => {
        try {
          setIsProgrammaticallyUpdating(true);
          const response = await API.get(
            `/translation/question/${id}/language/${selectedLanguageId}`
          );
          const translationData = response.data.data;

          setTranslationState(prev => ({
            ...prev,
            exists: true,
            isChecking: false,
          }));

          setValue("q_input_text", translationData.q_input_text || "");

          const currentAnswers = getValues("answer");
          const updatedAnswers = currentAnswers.map((answer: any, index: number) => ({
            ...answer,
            text: translationData.answers[index]?.text || "",
          }));

          setValue("answer", updatedAnswers);
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) {
            setTranslationState(prev => ({
              ...prev,
              exists: false,
              isChecking: false,
            }));
          } else {
            console.error("Error fetching translation data:", error);
            setTranslationState(prev => ({
              ...prev,
              exists: null,
              isChecking: false,
            }));
          }
        } finally {
          setIsProgrammaticallyUpdating(false);
        }
      };

      fetchTranslationForSelectedLanguage();
    }
  }, [selectedLanguageId]);

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (id && question) {
        setIsProgrammaticallyUpdating(true);
        try {
          const data = question.data;
          console.log("Fetched data:", data);

          const getImageBlob = async (url: string) => {
            try {
              const res = await API.get(`${import.meta.env.VITE_API_URL}/static/question/${url}`, {
                responseType: "blob",
              });
              const imageData = res.data;
              const filename = url.split("/").pop() || "default_filename";
              const metadata = { type: "image/*" };
              return new File([imageData], filename, metadata);
            } catch (error) {
              console.error("Error fetching image:", error);
              return null;
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
        } finally {
          setIsProgrammaticallyUpdating(false);
        }
      }
    };

    // Call the async function
    fetchAndSetData().catch(console.error);
  }, [id, question]);

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

  const getLanguageOptions = () => {
    let availableLanguages = [];

    if (isEdit && languagesWithStatus?.data) {
      availableLanguages = languagesWithStatus.data;
    } else {
      availableLanguages = languages?.data || [];
    }

    if (isEdit && languagesWithStatus?.data && languageType) {
      if (languageType === "sub") {
        const mainLanguage = languagesWithStatus.data.find(
          (lang: any) => lang.translation_status === "main"
        );

        if (mainLanguage) {
          availableLanguages = availableLanguages.filter(
            (lang: any) => lang.language_code !== mainLanguage.language_code
          );
        }
      } else if (languageType === "main") {
        availableLanguages = availableLanguages.filter(
          (lang: any) =>
            lang.translation_status === "main" ||
            lang.translation_status === "translation_available"
        );
      }
    }

    return availableLanguages;
  };

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

  const generateTranslation = async () => {
    if (!id || !selectedLanguageId) return;

    setTranslationState(prev => ({
      ...prev,
      isGenerating: true,
    }));

    try {
      const response = await API.post(
        `/translation/question/${id}/language/${selectedLanguageId}/generate`
      );
      const translationData = response.data.data;

      // Populate form with generated translation data
      setValue("q_input_text", translationData.q_input_text || "");

      // Populate answer texts (keeping images from main question)
      const currentAnswers = getValues("answer");
      const updatedAnswers = currentAnswers.map((answer: any, index: number) => ({
        ...answer,
        text: translationData.answers[index]?.text || "",
      }));

      setValue("answer", updatedAnswers);

      setTranslationState(prev => ({
        ...prev,
        exists: true,
        isGenerating: false,
      }));

      setHasUnsavedChanges(true); // Mark as unsaved since we populated with generated data
      if (onFormChange) {
        onFormChange(true);
      }
      snack.success("Translation generated successfully! You can now edit and save it.");
    } catch (error) {
      console.error("Error generating translation:", error);
      setTranslationState(prev => ({
        ...prev,
        isGenerating: false,
      }));

      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data?.message || "Failed to generate translation");
      } else {
        snack.error("Failed to generate translation");
      }
    }
  };

  const onSubmit = async (values: QuestionValues) => {
    console.log("=== SUBMIT TRIGGERED ===");
    console.log("Form values:", values);
    console.log("Form errors:", errors);
    console.log("Is form valid:", Object.keys(errors).length === 0);
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
      setHasUnsavedChanges(false); // Clear unsaved changes flag on successful save
      if (onFormChange) {
        onFormChange(false);
      }
      snack.success(`Question successfully ${isEdit ? "edited" : "created"}`);
      // navigate("/admin/question");
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
            <Box sx={{ display: "flex", gap: 2, flexGrow: 1 }}>
              <SelectCtrl
                name="language_type"
                label="Language Type"
                control={control}
                rules={{
                  required: "Field required",
                }}
                sx={{ flex: 1 }}
              >
                {languageTypeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </SelectCtrl>

              <SelectCtrl
                name="language_id"
                label="Language"
                control={control}
                rules={{
                  required: "Field required",
                }}
                sx={{ flex: 1 }}
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
          )}

          {!isEdit && (
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
          )}
        </Box>

        {/* Message when in sub-language mode but no language selected */}
        {isEdit && languageType === "sub" && (!selectedLanguageId || selectedLanguageId === "") && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
            <Typography variant="body2" color="warning.contrastText">
              Please select a language to create or edit a translation.
            </Typography>
          </Box>
        )}

        {/* Generate Translation Button - Show when editing and in sub-language mode */}
        {isEdit && languageType === "sub" && selectedLanguageId && selectedLanguageId !== "" && (
          <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateTranslation}
              disabled={
                translationState.isGenerating ||
                translationState.isChecking ||
                translationState.exists !== false
              }
              sx={{ px: 4, py: 1 }}
            >
              {translationState.isGenerating
                ? "Generating Translation..."
                : translationState.isChecking
                ? "Checking translation..."
                : translationState.exists === false
                ? "Generate Translation"
                : translationState.exists === true
                ? "Translation exists"
                : "Loading..."}
            </Button>
          </Box>
        )}

        {/* Show content only when not in sub-language mode OR when sub-language is selected */}
        {(!isEdit ||
          languageType !== "sub" ||
          (selectedLanguageId && selectedLanguageId !== "")) && (
          <>
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
          </>
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
