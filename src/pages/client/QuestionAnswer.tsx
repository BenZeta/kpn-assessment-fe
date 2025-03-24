import React, { useEffect, useMemo, useState } from "react";
import useAPI from "@/hooks/useAPI";
import useFetch from "@/hooks/useFetch";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Countdown from "react-countdown";
import logo from "../../assets/kpn-logo.png";
import { snack } from "@/providers/SnackbarProvider";

interface Choice {
  text?: string;
  image_url?: string | null;
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

const QuestionAnswer: React.FC = () => {
  const API = useAPI();
  const { id, token } = useParams<{ id: string; token: string }>();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);

  // const [endTime, setEndTime] = useState<number>(0);
  const [timeDisplay, setTimeDisplay] = useState("00:00:00");

  const { data: Question, loading } = useFetch<any>(`/assessment/${token}/test/subtest/${id}`);
  console.log(JSON.stringify(Question, null, 2));
  const assessmentData = Question?.data;
  const questions: QuestionItem[] = assessmentData?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const endTime = useMemo(() => {
    if (assessmentData?.duration) {
      const [hours, minutes, seconds] = assessmentData.duration.split(":").map(Number);
      const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
      return Date.now() + totalMs;
    }
  }, [assessmentData]);

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
        Object.keys(updated).forEach(k => {
          updated[k] = false;
        });
        updated[key] = true;
      } else {
        updated[key] = !updated[key];
      }
      return updated;
    });
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

  const saveAnswer = async (): Promise<boolean> => {
    if (!currentQuestion) return false;
    try {
      setIsSubmitting(true);

      // Submit jawaban ke API
      const answerPayload = {
        det_id: assessmentData?.det_id,
        question_id: currentQuestion.question_id,
        answer: {
          answer_a: !!selectedAnswers.a,
          answer_b: !!selectedAnswers.b,
          answer_c: !!selectedAnswers.c,
          answer_d: !!selectedAnswers.d,
          answer_e: !!selectedAnswers.e,
          answer_f: !!selectedAnswers.f,
          answer_g: !!selectedAnswers.g,
        },
      };

      await API.post(`/assessment/${token}/subtest/submission`, answerPayload);

      // Update local state di question data agar tetap sinkron
      currentQuestion.choosen_answer = { ...selectedAnswers };

      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const saved = await saveAnswer();
      if (saved) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }
  };

  const handlePrevQuestion = async () => {
    if (currentQuestionIndex > 0) {
      const saved = await saveAnswer();
      if (saved) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
    }
  };

  const handleQuestionSelect = async (event: { target: { value: string } }): Promise<void> => {
    const newIndex = Number(event.target.value) - 1;
    if (newIndex !== currentQuestionIndex) {
      const saved = await saveAnswer();
      if (saved) {
        setCurrentQuestionIndex(newIndex);
      }
    }
  };

  const handleOpenSubmitDialog = async () => {
    const saved = await saveAnswer();
    if (saved) {
      setOpenSubmitDialog(true);
    }
  };

  const handleCloseSubmitDialog = () => {
    setOpenSubmitDialog(false);
  };

  const handleConfirmSubmit = () => {
    // Contoh panggilan API untuk submit akhir assessment
    API.put(`/assessment/subtest/submission`, { det_id: assessmentData?.det_id })
      .then(() => {
        navigate(-1);
        snack.success("Your answer has been submitted");
        console.log("Assessment submitted");
      })
      .catch(err => {
        console.error(err);
      });
    setOpenSubmitDialog(false);
  };

  const handleCountdownComplete = async () => {
    await API.put(`/assessment/subtest/submission`, { det_id: assessmentData?.det_id }).then(() => {
      navigate(-1);
      snack.success("Your answer has been submitted");
    })
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
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
                {assessmentData?.subtest_name}
              </Typography>
            </Box>
          </Box>

          {/* Countdown */}
          <Typography variant="body2" color="text.secondary">
            Time remaining:{" "}
            <Typography component="span" color="primary">
              <Countdown
                date={endTime}
                onComplete={handleCountdownComplete}
                renderer={props => {
                  const { hours, minutes, seconds, completed } = props;
                  const h = String(hours || 0).padStart(2, "0");
                  const m = String(minutes || 0).padStart(2, "0");
                  const s = String(seconds || 0).padStart(2, "0");
                  const newTimeDisplay = `${h}:${m}:${s}`;

                  // Update the display state if it changed
                  if (newTimeDisplay !== timeDisplay) {
                    setTimeDisplay(newTimeDisplay);
                  }

                  return (
                    <span
                      style={{
                        fontSize: "14px",
                        color: timeDisplay <= "00:01:00" ? "#c41e1e" : "#1FB77D",
                      }}
                    >
                      {completed ? "00:00:00" : timeDisplay}
                    </span>
                  );
                }}
              />
            </Typography>
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 3 }}>
            Question {currentQuestionIndex + 1}/{totalQuestions}
          </Typography>

          <Typography variant="body1" sx={{ mb: 4 }}>
            {currentQuestion.input.text}
          </Typography>

          {/* Tampilkan gambar soal jika ada */}
          {currentQuestion.input.image_url && (
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <img
                src={`${import.meta.env.VITE_API_URL}/static/question/${currentQuestion.input.image_url}`}
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
                .filter(([_, choice]) => Object.keys(choice).length > 0)
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
                              src={`${import.meta.env.VITE_API_URL}/static/question/${choice.image_url}`}
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
            // Checkbox Group jika multiple
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
                              src={choice.image_url}
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
                disabled={currentQuestionIndex === 0 || isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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

            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <Select
                value={String(currentQuestionIndex + 1)}
                onChange={handleQuestionSelect}
                displayEmpty
                disabled={isSubmitting}
                renderValue={() => `Question: ${currentQuestionIndex + 1}`}
              >
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(num => (
                  <MenuItem key={num} value={String(num)}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      <Dialog open={openSubmitDialog} onClose={handleCloseSubmitDialog}>
        <DialogTitle>Konfirmasi Submit</DialogTitle>
        <DialogContent>
          <DialogContentText>Apakah Anda yakin ingin submit assessment ini?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubmitDialog} color="primary">
            Batal
          </Button>
          <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuestionAnswer;
