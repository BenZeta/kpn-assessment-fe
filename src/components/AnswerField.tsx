import FileInput from "@/components/forms/FileInput";
import TextFieldCtrl from "@/components/forms/TextField";
import NumericFieldCtrl from "@/components/forms/NumericField";
import { Button, Card, CardContent, Box, IconButton } from "@mui/material";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import { useFieldArray, useWatch } from "react-hook-form";
import { allowedImageFormat } from "@/utils/constant";
import { memo } from "react";
import { AnswerValues } from "@/pages/master-data/question/CreateEditQuestion";

interface AnswerFieldProps {
  control: any;
  setValue: any;
  getValues: any;
  id?: string;
}

const AnswerField = memo(function AnswerField({
  control,
  setValue,
  getValues,
  id,
}: AnswerFieldProps) {
  const watchAnswer = useWatch({
    control,
    name: "answer",
  });

  // Validation moved here so it's defined before useFieldArray
  const validateAnswers = (
    answers: AnswerValues[],
    answerType: "single" | "multiple"
  ): string | true => {
    const validAnswers = answers.filter(answer => answer.point > 0);

    if (answers.findIndex(answer => !answer.text && !answer.image) !== -1) {
      return "Each answer must have either text or an image.";
    }

    if (answerType === "single" && validAnswers.length !== 1) {
      return "Exactly one answer must have more than 0 points.";
    }

    if (answerType === "multiple" && validAnswers.length < 2) {
      return "At least two answers must have more than 0 points.";
    }

    if (answers.findIndex(answer => answer.image?.size && answer.image.size > 10485760) !== -1) {
      return "Max 10MB file allowed.";
    }

    if (
      answers.findIndex(
        answer => answer.image && !allowedImageFormat.includes(answer.image.type)
      ) !== -1
    ) {
      return "File formats not allowed.";
    }

    return true;
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "answer",
    rules: {
      validate: () => validateAnswers(getValues("answer"), getValues("answer_type")),
      minLength: {
        value: 2,
        message: "At least 2 answers are required.",
      },
      maxLength: {
        value: 7,
        message: "No more than 7 answers allowed.",
      },
    },
  });

  const addAnswerImage = (index: number, image: File) => {
    const objectUrl = URL.createObjectURL(image);
    setValue(`answer.${index}.image`, image);
    setValue(`answer.${index}.image_url`, objectUrl);
  };

  const removeAnswerImage = (index: number) => {
    setValue(`answer.${index}.image`, null);
    setValue(`answer.${index}.image_url`, null);
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {fields.map((field, index) => {
        const item = watchAnswer?.[index] || {};
        return (
          <Card
            key={field.id}
            variant="outlined"
            sx={{
              bgcolor: "action.selected",
              display: "flex",
              alignItems: "end",
            }}
          >
            <CardContent>
              {item.image || item.image_url ? (
                <Box
                  sx={{
                    display: "flex",
                    position: "relative",
                    mb: 2,
                    height: 200,
                  }}
                >
                  <img
                    src={
                      item.image_url && item.image_url.split("/")[0] === id
                        ? `${import.meta.env.VITE_API_URL}/static/question/${item.image_url}`
                        : item.image_url || ""
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  <IconButton
                    sx={{ position: "absolute" }}
                    onClick={() => removeAnswerImage(index)}
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>
              ) : (
                <FileInput
                  control={control}
                  name={`answer.${index}.image`}
                  text="Add Answer Image"
                  fullWidth
                  icon={<InsertPhotoIcon />}
                  accept="image/*"
                  passFile={file => addAnswerImage(index, file)}
                />
              )}
              <TextFieldCtrl
                control={control}
                name={`answer.${index}.text`}
                placeholder="Answer"
                textAlign="center"
                multiline
              />
              <NumericFieldCtrl
                control={control}
                name={`answer.${index}.point`}
                label="Point"
                allowNegative
                maxLength={3}
              />
              {fields.length > 2 && (
                <IconButton color="error" onClick={() => remove(index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </CardContent>
          </Card>
        );
      })}

      {fields.length !== 7 && (
        <Button
          variant="outlined"
          onClick={() =>
            append({
              text: "",
              image: null,
              point: 0,
            })
          }
        >
          <AddCircleIcon />
        </Button>
      )}
    </Box>
  );
});

export default AnswerField;
