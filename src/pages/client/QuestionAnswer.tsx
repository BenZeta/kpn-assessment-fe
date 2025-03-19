import useFetch from "@/hooks/useFetch";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Typography,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useParams } from "react-router-dom";

const QuestionAnswer: React.FC = () => {
  const { id } = useParams();
  const { token } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState("A");
  const totalQuestions = 10;

const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedOption(event.target.value);
};

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

interface QuestionSelectEvent {
    target: {
        value: string;
    };
}

const handleQuestionSelect = (event: QuestionSelectEvent): void => {
    setCurrentQuestion(Number(event.target.value));
};

  const { data: Question } = useFetch<any>(`/assessment/${token}/test/subtest/${id}`);
  console.log(JSON.stringify(Question, null, 2));
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
              src="https://via.placeholder.com/30/e63946/FFFFFF?text=X"
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
                Sub Test Title
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Time to answer:{" "}
            <Typography component="span" color="primary">
              0 h 2 min. 0 sec
            </Typography>
          </Typography>
        </Box>

        {/* Question Content */}
        <Box sx={{ p: 4 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Question {currentQuestion}/{totalQuestions}
          </Typography>

          <Typography variant="body1" sx={{ mb: 4 }}>
            Ponam in culpa idiota aliis pravitatis. Principium ponere culpam in se justum
            praeceptum. Neque impropreres et aliis qui non perfecte ipse docuit.
          </Typography>

          <RadioGroup value={selectedOption} onChange={handleOptionChange} sx={{ mb: 4 }}>
            {["A", "B", "C", "D"].map(option => (
              <FormControlLabel
                key={option}
                value={option}
                control={
                  <Radio
                    sx={{
                      color: "#81b29a",
                      "&.Mui-checked": {
                        color: "#81b29a",
                      },
                    }}
                  />
                }
                label={`Option ${option}`}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>

          {/* Navigation Controls */}
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
            </Box>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <Select
                value={String(currentQuestion)}
                onChange={handleQuestionSelect}
                displayEmpty
                renderValue={() => `Question: ${currentQuestion}`}
              >
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(num => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
export default QuestionAnswer;
