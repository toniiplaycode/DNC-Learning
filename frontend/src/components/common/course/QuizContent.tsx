import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
} from "@mui/material";
import { Timer, Help, CheckCircle, Cancel, Close } from "@mui/icons-material";
import QuizExplanation from "./QuizExplanation";

interface Question {
  id: number;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  id: number;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number;
  maxAttempts: number;
  questions: Question[];
}

interface QuizContentProps {
  quizData: QuizData;
  onComplete: (score: number) => void;
}

const mockQuizData: QuizData = {
  id: 1,
  title: "Kiểm tra kiến thức React Hooks",
  description: "Bài kiểm tra đánh giá kiến thức về React Hooks cơ bản",
  timeLimit: 30,
  passingScore: 70,
  maxAttempts: 2,
  questions: [
    {
      id: 1,
      content: "useState hook được sử dụng để làm gì?",
      options: [
        "Quản lý side effects",
        "Quản lý state trong functional component",
        "Tối ưu performance",
        "Xử lý routing",
      ],
      correctAnswer: 1,
      explanation:
        "useState là hook cơ bản để quản lý state trong functional component.",
    },
    // Thêm các câu hỏi khác...
  ],
};

// Thêm hàm helper để chia câu hỏi thành các cột
const getQuestionColumns = (totalQuestions: number) => {
  const columns = Math.ceil(totalQuestions / 10);
  const result = [];
  for (let i = 0; i < columns; i++) {
    result.push(
      Array.from(
        { length: Math.min(10, totalQuestions - i * 10) },
        (_, index) => index + i * 10
      )
    );
  }
  return result;
};

// Thêm helper function để xác định trạng thái câu hỏi
const getQuestionStatus = (
  questionIndex: number,
  currentQuestion: number,
  answers: number[]
) => {
  if (currentQuestion === questionIndex) {
    return "current";
  }
  if (answers[questionIndex] !== undefined) {
    return "answered";
  }
  return "unanswered";
};

const QuizContent: React.FC<QuizContentProps> = ({ quizData, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(quizData.timeLimit * 60);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Timer
  React.useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmit();
    }
  }, [timeLeft, showResult]);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setShowResult(true);
    onComplete(score);
  };

  const calculateScore = () => {
    const correctAnswers = answers.reduce((acc, answer, index) => {
      if (answer === undefined) return acc;
      return answer === quizData.questions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
    return (correctAnswers / quizData.questions.length) * 100;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (showResult) {
    const score = calculateScore();
    const passed = score >= quizData.passingScore;

    return (
      <Box>
        <Card>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              {passed ? (
                <CheckCircle color="success" sx={{ fontSize: 60 }} />
              ) : (
                <Cancel color="error" sx={{ fontSize: 60 }} />
              )}
              <Typography variant="h5" textAlign="center">
                {passed
                  ? "Chúc mừng! Bạn đã hoàn thành bài kiểm tra"
                  : "Bạn chưa đạt yêu cầu"}
              </Typography>
              <Typography
                variant="h4"
                color={passed ? "success.main" : "error.main"}
              >
                {score.toFixed(1)}%
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => setShowExplanation(true)}
            startIcon={<Help />}
            size="large"
          >
            Xem giải thích
          </Button>
        </Box>

        <Dialog
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Giải thích chi tiết
              <IconButton
                size="small"
                onClick={() => setShowExplanation(false)}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <QuizExplanation
              questions={quizData.questions}
              userAnswers={answers}
              score={calculateScore()}
              passingScore={quizData.passingScore}
            />
          </DialogContent>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      {/* Question List */}
      <Card sx={{ width: "auto", alignSelf: "flex-start" }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Danh sách câu hỏi
          </Typography>
          <Stack direction="row" spacing={3}>
            {getQuestionColumns(quizData.questions.length).map(
              (column, colIndex) => (
                <Stack key={colIndex} spacing={1}>
                  {column.map((questionIndex) => {
                    const status = getQuestionStatus(
                      questionIndex,
                      currentQuestion,
                      answers
                    );
                    return (
                      <Button
                        key={questionIndex}
                        variant={
                          status === "current" ? "contained" : "outlined"
                        }
                        size="small"
                        onClick={() => setCurrentQuestion(questionIndex)}
                        sx={{
                          minWidth: 40,
                          width: 40,
                          height: 40,
                          p: 0,
                          borderRadius: 2,
                          ...(status === "answered" && {
                            backgroundColor: "action.hover",
                            "&:hover": {
                              backgroundColor: "action.selected",
                            },
                          }),
                          ...(status === "current" && {
                            backgroundColor: "primary.main",
                            "&:hover": {
                              backgroundColor: "primary.dark",
                            },
                          }),
                        }}
                      >
                        {questionIndex + 1}
                      </Button>
                    );
                  })}
                </Stack>
              )
            )}
          </Stack>

          {/* Legend */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Chú thích:
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption">
                  Đã trả lời ({answers.filter((a) => a !== undefined).length})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: "primary.main",
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption">Câu hiện tại</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption">
                  Chưa trả lời (
                  {quizData.questions.length -
                    answers.filter((a) => a !== undefined).length}
                  )
                </Typography>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Question Content */}
      <Box sx={{ flex: 1 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">{quizData.title}</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Timer color="action" />
                <Typography color={timeLeft < 300 ? "error" : "text.secondary"}>
                  {formatTime(timeLeft)}
                </Typography>
              </Stack>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={((currentQuestion + 1) / quizData.questions.length) * 100}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Câu {currentQuestion + 1}/{quizData.questions.length}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {quizData.questions[currentQuestion].content}
            </Typography>

            <RadioGroup
              value={answers[currentQuestion] ?? -1}
              onChange={(e) => handleAnswer(Number(e.target.value))}
            >
              <Stack spacing={2}>
                {quizData.questions[currentQuestion].options.map(
                  (option, index) => (
                    <FormControlLabel
                      key={index}
                      value={index}
                      control={<Radio />}
                      label={option}
                      sx={{
                        p: 1,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    />
                  )
                )}
              </Stack>
            </RadioGroup>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion((prev) => prev - 1)}
              >
                Câu trước
              </Button>
              {currentQuestion < quizData.questions.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                >
                  Câu tiếp theo
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={
                    answers.filter((a) => a !== undefined).length !==
                    quizData.questions.length
                  }
                >
                  Nộp bài
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default QuizContent;
