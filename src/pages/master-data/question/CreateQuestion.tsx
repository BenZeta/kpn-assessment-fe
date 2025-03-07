import CreateQuestionForm from "@/components/question/CreateQuestionForm";
import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Grid2 as Grid,
  IconButton,
  Stack,
  Typography
} from "@mui/material";
import { Create } from "@refinedev/mui";
import React from "react";
import { useNavigate } from "react-router-dom";

const CreateQuestion: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Create
      title={
        <Typography variant="h5" fontWeight="600">
          Create Question
        </Typography>
      } 
      goBack={
        <IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />
      }
      headerProps={{ sx: { backgroundColor: "#E5E7EB" } }}
    >
      <Grid container spacing={2} padding="16px 0" borderRadius="8px">
        <Grid size={4}>
          <Box border="1px solid red">
            <Typography variant="h6" fontWeight="600">
              Category
            </Typography>
            <Stack spacing={2}>

            </Stack>
          </Box>
        </Grid>
        <Grid size={8}>
          <CreateQuestionForm />
        </Grid>
      </Grid>
    </Create>
  );
};
export default CreateQuestion;
