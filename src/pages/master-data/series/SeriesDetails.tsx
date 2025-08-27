import QuestionCard from "@/components/question/QuestionCard";
import useFetch from "@/hooks/useFetch";
import { ArrowBack } from "@mui/icons-material";
import { IconButton, Stack, Typography, Grid2 as Grid, Box } from "@mui/material";
import { Show } from "@refinedev/mui";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "@/hooks/useAuthStore";

const SeriesDetails: React.FC = () => {
  const getPermission = useAuthStore(state => state.getPermission);
  const { id } = useParams();
  const { data: series } = useFetch<any>(`/series/${id}`);
  const navigate = useNavigate();

  const transformedQuestions = series?.data?.questions?.map((question: any) => ({
    id: question.question_id,
    q_input_text: question.input_text,
    answer_type: question.answer_type,
    category_name: question.category_name,
    answers: question.answers
      .filter((answer: any) => answer.text !== null) // Filter out null answers
      .map((answer: any) => ({
        text: answer.text || "",
        image_url: answer.image,
        point: answer.point || "0",
      })),
  }));

  return (
    <Show
      title={
        <Typography fontWeight="600" variant="h5">
          Series Detail
        </Typography>
      }
      goBack={
        getPermission("fread", 4) ? (
          <IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />
        ) : (
          <></>
        )
      }
    >
      <Grid container spacing={2} borderRadius="8px" padding="0 16px">
        <Grid size={4}>
          <Typography variant="h6" fontWeight="600">
            Series
          </Typography>
          <Box sx={{ border: "1px solid gray", borderRadius: "6px", padding: "8px" }}>
            <Typography fontWeight="600">
              {series?.data.series_code}
              <span>|</span>
              {series?.data.series_name}
            </Typography>
          </Box>
        </Grid>
        <Grid size={8}>
          <Stack spacing={2}>
            {transformedQuestions?.map((questionData: any) => (
              <QuestionCard key={questionData.id} questionData={questionData} disabled={true} />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Show>
  );
};
export default SeriesDetails;
