import { Drawer, Box, Typography, Grid2 as Grid, Button } from "@mui/material";
import React from "react";

interface Choice {
  text?: string;
  image_url?: string | null;
}

type QuestionType = {
  question_id: string;
  subtest_id: string;
  input: {
    text: string;
    image_url: string | null;
  };
  answer_type: "single" | "multiple";
  choices: Record<string, Choice>;
  choosen_answer: Record<string, boolean>;
};

type QuestionDrawerProps = {
  currentQuestionIndex: number;
  saveAnswer: () => Promise<boolean>;
  setCurrentQuestionIndex: (index: number) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  questions: QuestionType[];
};

const QuestionDrawer: React.FC<QuestionDrawerProps> = ({
  currentQuestionIndex,
  setCurrentQuestionIndex,
  saveAnswer,
  drawerOpen,
  setDrawerOpen,
  questions,
}) => {
  const handleQuestionClick = async (index: number) => {
    // Simpan jawaban sebelum pindah soal
    if (index !== currentQuestionIndex) {
      const saved = await saveAnswer();
      if (saved) {
        setCurrentQuestionIndex(index);
      }
    }
    setDrawerOpen(false);
  };
  return (
    <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box sx={{ p: 2, width: 250 }}>
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
          List Questions
        </Typography>

        <Grid container spacing={2} columns={5}>
          {questions.map((question, i) => {
            const isAnswered = Object.values(question.choosen_answer).some(val => val === true);
            const isActive = i === currentQuestionIndex;
            return (
              <Grid size={{ xs: 1 }} key={i}>
                <Button
                  variant="contained"
                  onClick={() => handleQuestionClick(i)}
                  sx={{
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    minWidth: 0,
                    backgroundColor: isActive
                      ? "primary.main" // Warna saat aktif
                      : isAnswered
                      ? "#81b29a" // Warna jika sudah dijawab
                      : "#fff", // Warna default jika belum dijawab
                    "&:hover": {
                      backgroundColor: isActive
                        ? "primary.dark"
                        : isAnswered
                        ? "#619f81"
                        : "#f5f5f5",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: isActive ? "#fff" : isAnswered ? "#fff" : "text.primary",
                      fontWeight: "bold",
                    }}
                  >
                    {i + 1}
                  </Typography>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Drawer>
  );
};
export default QuestionDrawer;
