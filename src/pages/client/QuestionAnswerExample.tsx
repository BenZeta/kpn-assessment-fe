import DialogComp from "@/components/Dialog";
import useAPI from "@/hooks/useAPIAssesse";
import useFetch from "@/hooks/useFetch";
import { snack } from "@/providers/SnackbarProvider";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { isAxiosError } from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/kpn-logo.png";
import ProctoringProvider from "./ProctoringProvider";

interface Choice {
  text?: string;
  image_url?: string | null;
  point?: string;
}

interface QuestionItem {
  question_id: string;
  subtest_id: string;
  input: {
    text: string;
    image_url: string | null;
  };
  answer_type: "single" | "multiple";
  choices: Record<string, Choice>;
  choosen_answer: Record<string, boolean>;
}

const QuestionAnswerExample: React.FC = () => {
  const api = useAPI();
  const navigate = useNavigate();
  const { id, token } = useParams<{ id: string; token: string }>();
  const { data: Question, loading } = useFetch<any>(`/assessment/test/subtest/example/${id}`);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, boolean>>({});
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);

  // Determine if example answers should be shown
  const isExampleAnswerShown = useMemo(
    () => Question?.is_example_answer_shown ?? false,
    [Question]
  );

  const questions = useMemo<QuestionItem[]>(() => Question?.data ?? [], [Question]);
  const subtestname = useMemo(() => Question?.subtest_name ?? "", [Question]);
  const intro_desc = useMemo<string>(() => Question?.intro_desc ?? "", [Question]);

  const totalQuestions = useMemo(() => questions.length, [questions]);
  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [currentQuestionIndex, questions]
  );

  const rightAnswers = useMemo(() => {
    return questions.map(value => {
      let answer = "";
      Object.keys(value.choices).forEach(key => {
        const choice = value.choices[key];
        const pointint = parseInt(choice.point || "0", 10);
        if (pointint > 0) {
          answer = key;
        }
      });
      return answer;
    });
  }, [questions]);

  const currentAnswer = useMemo(
    () => Object.entries(selectedAnswers).find(([, val]) => val)?.[0] ?? null,
    [selectedAnswers]
  );

  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswers({ ...currentQuestion.choosen_answer });
    }
  }, [currentQuestionIndex, currentQuestion]);

  const handleChoiceChange = (key: string) => {
    if (!currentQuestion) return;
    const { answer_type } = currentQuestion;
    setSelectedAnswers(prev => {
      const updated = { ...prev };
      if (answer_type === "single") {
        Object.keys(updated).forEach(k => (updated[k] = false));
        updated[key] = true;
      } else {
        updated[key] = !updated[key];
      }
      currentQuestion.choosen_answer = updated;
      return updated;
    });
  };

  const handleClearAll = () => {
    setSelectedAnswers(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => (updated[k] = false));
      return updated;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleOpenSubmitDialog = () => setOpenSubmitDialog(true);
  const handleCloseSubmitDialog = () => setOpenSubmitDialog(false);

  const handleContinueToTest = async () => {
    try {
      await api.patch(`assessment/test/subtest/example/${id}`);
      navigate(`/client/assessment/${token}/subtest/${id}`);
    } catch (error) {
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (questions.length === 0) return null;

  return (
    <ProctoringProvider isskip={true}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ overflow: "hidden", borderRadius: 1 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: "#f5f7f9",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src={logo}
                alt="Assessment Logo"
                sx={{ width: 30, height: 30, mr: 1, borderRadius: 1 }}
              />
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
                ASSESSMENT
              </Typography>
              <Box
                sx={{
                  borderLeft: "2px solid #e0e0e0",
                  pl: 2,
                  display: { xs: "none", sm: "block" },
                }}
              >
                <Typography variant="subtitle1" color="text.secondary">
                  {subtestname}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h3">Example Question</Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            <Typography variant="body1" fontWeight={600} sx={{ mb: 3 }}>
              Question {currentQuestionIndex + 1}/{totalQuestions}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, my: 1 }}>
              {intro_desc.split("\n").map((line, idx) => (
                <Typography key={idx} paragraph>
                  {line}
                </Typography>
              ))}
            </Paper>

            <Typography variant="body1" sx={{ mb: 4 }}>
              {currentQuestion.input.text}
            </Typography>

            {currentQuestion.input.image_url && (
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <img
                  src={`${import.meta.env.VITE_API_URL}/static/question/${
                    currentQuestion.input.image_url
                  }`}
                  alt="Question illustration"
                  style={{ maxWidth: "100%", maxHeight: 300 }}
                />
              </Box>
            )}

            {/* Choices */}
            {currentQuestion.answer_type === "single" ? (
              <RadioGroup value={currentAnswer || ""} sx={{ mb: 4 }}>
                {Object.entries(currentQuestion.choices)
                  .filter(([, choice]) => choice.text || choice.image_url)
                  .map(([key, choice]) => (
                    <FormControlLabel
                      key={key}
                      value={key}
                      control={<Radio onChange={() => handleChoiceChange(key)} />}
                      label={choice.text}
                      sx={{ mb: 1 }}
                    />
                  ))}
              </RadioGroup>
            ) : (
              <Box sx={{ mb: 4 }}>
                {Object.entries(currentQuestion.choices)
                  .filter(([, choice]) => choice.text || choice.image_url)
                  .map(([key, choice]) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={!!selectedAnswers[key]}
                          onChange={() => handleChoiceChange(key)}
                        />
                      }
                      label={choice.text}
                    />
                  ))}
              </Box>
            )}

            {/* Show correct/wrong only if allowed */}
            {isExampleAnswerShown && currentAnswer && (
              <Alert
                severity={
                  currentAnswer === rightAnswers[currentQuestionIndex] ? "success" : "error"
                }
                sx={{ mb: 2 }}
              >
                {currentAnswer === rightAnswers[currentQuestionIndex]
                  ? "Answer Right"
                  : "Answer Wrong"}
              </Alert>
            )}

            <Box sx={{ mb: 2 }}>
              <Button variant="outlined" onClick={handleClearAll}>
                Clear All
              </Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FaChevronLeft />}
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Prev
              </Button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                  variant="outlined"
                  endIcon={<FaChevronRight />}
                  onClick={handleNextQuestion}
                >
                  Next
                </Button>
              ) : (
                <Button variant="outlined" onClick={handleOpenSubmitDialog}>
                  Submit
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        <DialogComp
          title="Continue Test Assessment"
          open={openSubmitDialog}
          onClose={handleCloseSubmitDialog}
          actions={
            <>
              <Button onClick={handleCloseSubmitDialog}>Cancel</Button>
              <Button variant="contained" onClick={handleContinueToTest}>
                Continue
              </Button>
            </>
          }
        >
          <Typography>Are you sure want to continue?</Typography>
        </DialogComp>
      </Container>
    </ProctoringProvider>
  );
};

export default QuestionAnswerExample;
