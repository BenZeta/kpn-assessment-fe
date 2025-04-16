import DialogComp from "@/components/Dialog";
import QuestionDrawer from "@/components/QuestionDrawer";
import useAPI from "@/hooks/useAPIDarwin";
import useFetch from "@/hooks/useFetch";
import { snack } from "@/providers/SnackbarProvider";
import {
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
  Alert,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/kpn-logo.png";
import ProctoringProvider from "./ProctoringProvider";
import { isAxiosError } from "axios";
import { QuestionSkeleton } from "@/components/Skeleton";

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

  const questions = useMemo<QuestionItem[]>(() => Question?.data ?? [], [Question]);
  const subtestname = useMemo(() => Question?.subtest_name ?? "", [Question]);
  const intro_desc = useMemo<string>(() => Question?.intro_desc ?? "", [Question]);

  const totalQuestions = useMemo(() => {
    return questions.length;
  }, [questions]);
  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [currentQuestionIndex, questions]
  );

  const rightAnswers = useMemo(() => {
    return questions.map(value => {
      let answer = "";
      Object.keys(value.choices).map(key => {
        if (value.choices[key].point) {
          let pointint = parseInt(value.choices[key].point);
          if (pointint > 0) {
            answer = key;
          }
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
  }, [currentQuestionIndex]);

  const handleChoiceChange = (key: string) => {
    if (!currentQuestion) return;

    const { answer_type } = currentQuestion;
    let updatedAns = {};
    setSelectedAnswers(prev => {
      const updated = { ...prev };
      if (answer_type === "single") {
        Object.keys(updated).forEach(k => {
          updated[k] = false;
        });
        updated[key] = true;
      } else {
        updated[key] = !updated[key];
      }
      updatedAns = updated;
      return updated;
    });
    questions[currentQuestionIndex].choosen_answer = updatedAns;
  };

  const handleClearAll = () => {
    setSelectedAnswers(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        updated[key] = false;
      });
      return updated;
    });
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = async () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleOpenSubmitDialog = async () => {
    setOpenSubmitDialog(true);
  };

  const handleCloseSubmitDialog = () => {
    setOpenSubmitDialog(false);
  };

  const handleContinueToTest = async () => {
    try {
      const { data } = await api.patch(`assessment/test/subtest/example/${id}`);
      navigate(`/client/assessment/${token}/subtest/${id}`);
    } catch (error) {
      console.error(error);
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

  if (questions.length > 0) {
    return (
      <ProctoringProvider isskip={true}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper
            elevation={1}
            sx={{
              overflow: "hidden",
              borderRadius: 1,
            }}
          >
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
                  sx={{
                    width: 30,
                    height: 30,
                    mr: 1,
                    borderRadius: "4px",
                  }}
                />
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{
                    fontWeight: "bold",
                    color: "#2f3e46",
                    mr: 2,
                  }}
                >
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
              <Box>
                <Typography variant="h3">Example Question</Typography>
              </Box>
            </Box>

            <Box sx={{ p: 4 }}>
              <Typography variant="body1" fontWeight={600} sx={{ mb: 3 }}>
                Question {currentQuestionIndex + 1}/{totalQuestions}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, my: 1 }}>
                {intro_desc.split("\n").map(value => (
                  <p>{value}</p>
                ))}
              </Paper>

              <Typography variant="body1" sx={{ mb: 4 }}>
                {currentQuestion.input.text}
              </Typography>

              {/* Tampilkan gambar soal jika ada */}
              {currentQuestion.input.image_url && (
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <img
                    src={`${import.meta.env.VITE_API_URL}/static/question/${
                      currentQuestion.input.image_url
                    }`}
                    alt="Question illustration"
                    style={{ maxWidth: "100%", maxHeight: "300px" }}
                  />
                </Box>
              )}

              {currentQuestion.answer_type === "single" ? (
                // Radio Group jika single
                <RadioGroup
                  value={Object.entries(selectedAnswers).find(([, val]) => val)?.[0] || ""}
                  sx={{ mb: 4 }}
                >
                  {Object.entries(currentQuestion.choices)
                    .filter(([_, choice]) => {
                      return (
                        Object.keys(choice).length > 0 &&
                        (choice.image_url != null || choice.text != null)
                      );
                    })
                    .map(([key, choice]) => (
                      <FormControlLabel
                        key={key}
                        value={key}
                        control={
                          <Radio
                            sx={{
                              color: "#81b29a",
                              "&.Mui-checked": {
                                color: "#81b29a",
                              },
                            }}
                            onChange={() => handleChoiceChange(key)}
                          />
                        }
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography>{choice.text}</Typography>
                            {choice.image_url && (
                              <Box sx={{ ml: 2 }}>
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/static/question/${
                                    choice.image_url
                                  }`}
                                  alt={`Option ${key}`}
                                  style={{ maxHeight: "50px" }}
                                />
                              </Box>
                            )}
                          </Box>
                        }
                        sx={{ mb: 1 }}
                      />
                    ))}
                </RadioGroup>
              ) : (
                <Box sx={{ mb: 4 }}>
                  {Object.entries(currentQuestion.choices)
                    .filter(([_, choice]) => Object.keys(choice).length > 0)
                    .map(([key, choice]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            checked={!!selectedAnswers[key]}
                            onChange={() => handleChoiceChange(key)}
                            sx={{
                              color: "#81b29a",
                              "&.Mui-checked": {
                                color: "#81b29a",
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ alignItems: "center" }}>
                            <Typography>{choice.text}</Typography>
                            {choice.image_url && (
                              <Box sx={{ ml: 2 }}>
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/static/question/${
                                    choice.image_url
                                  }`}
                                  alt={`Option ${key}`}
                                  style={{ maxHeight: "50px" }}
                                />
                              </Box>
                            )}
                          </Box>
                        }
                        sx={{ display: "flex" }}
                      />
                    ))}
                </Box>
              )}
              {currentAnswer && (
                <Alert
                  severity={
                    currentAnswer == rightAnswers[currentQuestionIndex] ? "success" : "error"
                  }
                >
                  {currentAnswer == rightAnswers[currentQuestionIndex]
                    ? "Answer Right"
                    : "Answer Wrong"}
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" color="warning" onClick={handleClearAll}>
                  Clear All Choice
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<FaChevronLeft />}
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    sx={{
                      mr: 2,
                      borderColor: "#e0e0e0",
                      color: "text.secondary",
                      "&:hover": {
                        borderColor: "#c3c3c3",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    Prev
                  </Button>

                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <Button
                      variant="outlined"
                      endIcon={<FaChevronRight />}
                      onClick={handleNextQuestion}
                      sx={{
                        borderColor: "#e0e0e0",
                        color: "#81b29a",
                        "&:hover": {
                          borderColor: "#81b29a",
                          backgroundColor: "rgba(129, 178, 154, 0.04)",
                        },
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={handleOpenSubmitDialog}
                      sx={{
                        borderColor: "#e0e0e0",
                        color: "#81b29a",
                        "&:hover": {
                          borderColor: "#81b29a",
                          backgroundColor: "rgba(129, 178, 154, 0.04)",
                        },
                      }}
                    >
                      Submit
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>

          <DialogComp
            title="Continue Test Assessment"
            open={openSubmitDialog}
            onClose={handleCloseSubmitDialog}
            actions={
              <>
                <Button onClick={handleCloseSubmitDialog} variant="outlined" color="primary">
                  Cancel
                </Button>
                <Button onClick={handleContinueToTest} variant="contained" color="success">
                  Continue
                </Button>
              </>
            }
          >
            <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
              Are you sure want to continue?
            </Typography>
          </DialogComp>
        </Container>
      </ProctoringProvider>
    );
  }
};

export default QuestionAnswerExample;
