import DialogComp from "@/components/Dialog";
import QuestionAnswer from "@/components/QuestionAnswer";
import { QuestionSkeleton } from "@/components/Skeleton";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { Box, Button, Container, Typography, IconButton } from "@mui/material";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Show } from "@refinedev/mui";
import { ArrowBack } from "@mui/icons-material";

const QuestionDetails = () => {
  const { id } = useParams();
  const { data } = useFetch<any>(`/question/${id}`);
  const getPermission = useAuthStore(state => state.getPermission);
  const navigate = useNavigate();
  const API = useAPI();
  const { showLoading, hideLoading } = useLoading();
  const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();
  const question = data?.data;

  const handleDelete = async () => {
    showLoading();
    const url = `/question/${id}`;

    try {
      const res = await API.delete(url);
      snack.success(`${res.data.message}`);
      navigate("/admin/question");
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data.message);
      } else {
        snack.error("Error");
      }
      console.error(error);
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Show
        title={
          <Typography fontWeight="600" variant="h5">
            Question Details
          </Typography>
        }
        goBack={<IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Typography fontWeight="bold">Total Points: {question?.total_points}</Typography>
          </Box>

          {question ? (
            <QuestionAnswer question={question.question} answers={question.answers} />
          ) : (
            <QuestionSkeleton />
          )}

          {getPermission("fdelete", 7) && (
            <Box sx={{ my: 2 }}>
              <Button variant="contained" color="error" sx={{ mt: 1 }} onClick={openDelete}>
                Delete Question
              </Button>
            </Box>
          )}
        </Container>
      </Show>

      <DialogComp
        title={`Delete Question`}
        open={isOpenDelete}
        onClose={closeDelete}
        actions={
          <>
            <Button onClick={closeDelete} variant="outlined" color="error">
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              Delete
            </Button>
          </>
        }
      >
        <Typography>{`Are you sure you want to delete this question?`}</Typography>
      </DialogComp>
    </>
  );
};
export default QuestionDetails;
