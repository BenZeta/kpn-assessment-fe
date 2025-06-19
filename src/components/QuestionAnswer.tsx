import { Box, Card, CardActions, Grid2 as Grid, CardContent } from "@mui/material";
import Answer from "./Answer";
import { QuestionProps } from "@/types/MasterData";
import parse from "html-react-parser";
import { useNavigate } from "react-router-dom";

const QuestionAnswer = ({ question, answers }: QuestionProps) => {
  const navigate = useNavigate();
  return (
    <Card raised>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {question.input_image_url && (
            <Grid
              size={{ xs: 12, sm: 4 }}
              sx={{
                display: "flex",
                position: "relative",
                height: 220,
                justifyContent: "center",
              }}
            >
              <img
                src={`${import.meta.env.VITE_API_URL}/static/question/${question.input_image_url}`}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Grid>
          )}
          <Grid
            size={{ xs: 12, sm: question.input_image_url ? 8 : 12 }}
            sx={{ position: "relative" }}
          >
            {question.input_text && (
              <Box
                sx={{
                  display: "flex",
                  minHeight: 220,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {parse(question.input_text ?? "")}
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
          {answers.map(answer => (
            <Answer text={answer.text} image_url={answer.image_url} point={answer.point} />
          ))}
        </Box>
      </CardActions>
    </Card>
  );
};
export default QuestionAnswer;
