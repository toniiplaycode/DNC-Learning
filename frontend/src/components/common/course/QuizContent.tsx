import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Timer,
  Help,
  CheckCircle,
  Cancel,
  Close,
  PlayArrow,
} from "@mui/icons-material";
import { fetchQuizzesByLesson } from "../../../features/quizzes/quizzesSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectLessonQuizzes } from "../../../features/quizzes/quizzesSelectors";

interface Question {
  id: number;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

interface QuizContentProps {
  lessonId: number;
  onComplete: (score: number) => void;
}

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

const QuizContent: React.FC<QuizContentProps> = ({ lessonId, onComplete }) => {
  const dispatch = useAppDispatch();
  const lessonQuizzes = useAppSelector(selectLessonQuizzes);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);

  // Use the first quiz from the lesson quizzes if available
  const activeQuiz =
    lessonQuizzes && lessonQuizzes.length > 0 ? lessonQuizzes[0] : null;

  useEffect(() => {
    // Fetch quizzes when the component mounts
    dispatch(fetchQuizzesByLesson(lessonId));
  }, [dispatch, lessonId]);

  useEffect(() => {
    // Initialize time limit if the quiz has one and has been started
    if (activeQuiz && activeQuiz.timeLimit && !timeRemaining && quizStarted) {
      setTimeRemaining(activeQuiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [activeQuiz, timeRemaining, quizStarted]);

  useEffect(() => {
    if (activeQuiz && activeQuiz.showExplanation === 0) {
      setShowExplanations(false);
    }
    if (activeQuiz && activeQuiz.showExplanation === 1) {
      setShowExplanations(true);
    }
  }, [activeQuiz]);

  console.log(activeQuiz?.showExplanation);

  useEffect(() => {
    // Timer logic
    if (timeRemaining !== null && timeRemaining > 0 && !quizSubmitted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !quizSubmitted) {
      handleSubmit();
    }
  }, [timeRemaining, quizSubmitted]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (!activeQuiz) return;

    let correctCount = 0;

    answers.forEach((answer, index) => {
      const question = activeQuiz.questions[index];
      const correctOption = question.options.findIndex(
        (option) => option.isCorrect
      );
      if (answer === correctOption) {
        correctCount++;
      }
    });

    const finalScore = Math.round(
      (correctCount / activeQuiz.questions.length) * 100
    );
    setScore(finalScore);
    setQuizSubmitted(true);
    onComplete(finalScore);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };
  if (!activeQuiz) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Đang tải bài quiz...</Typography>
      </Box>
    );
  }

  if (quizSubmitted) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Kết quả
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                mb: 3,
              }}
            >
              <Typography
                variant="h3"
                color={score >= 70 ? "success.main" : "error.main"}
              >
                {score}%
              </Typography>
              <Typography variant="subtitle1">
                {score >= 70 ? "Đạt" : "Chưa đạt"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Help />}
                onClick={() => setShowExplanations(!showExplanations)}
                sx={{ mx: 1 }}
              >
                {showExplanations
                  ? "Ẩn kết quả chi tiết"
                  : "Xem kết quả chi tiết"}
              </Button>
            </Box>

            {showExplanations && (
              <>
                <Typography variant="h6" gutterBottom>
                  Chi tiết câu trả lời:
                </Typography>

                {activeQuiz.questions.map((question, index) => {
                  const userAnswer =
                    answers[index] !== undefined ? answers[index] : -1;
                  const correctOptionIndex = question.options.findIndex(
                    (option) => option.isCorrect
                  );
                  const isCorrect = userAnswer === correctOptionIndex;

                  return (
                    <Paper
                      key={question.id}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderLeft: 4,
                        borderColor: isCorrect ? "primary.main" : "error.main",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "medium", flex: 1 }}
                        >
                          {index + 1}. {question.questionText}
                        </Typography>

                        {isCorrect ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Cancel color="error" />
                        )}
                      </Box>

                      <Box sx={{ pl: 4 }}>
                        {question.options.map((option, optionIndex) => (
                          <Typography
                            key={option.id}
                            variant="body2"
                            sx={{
                              color:
                                optionIndex === correctOptionIndex
                                  ? "success.main"
                                  : optionIndex === userAnswer
                                  ? "error.main"
                                  : "text.primary",
                              fontWeight:
                                optionIndex === correctOptionIndex ||
                                optionIndex === userAnswer
                                  ? "bold"
                                  : "normal",
                            }}
                          >
                            {String.fromCharCode(65 + optionIndex)}.{" "}
                            {option.optionText}
                            {optionIndex === userAnswer &&
                              optionIndex !== correctOptionIndex &&
                              " (Đã chọn)"}
                            {optionIndex === correctOptionIndex &&
                              " (Đáp án đúng)"}
                          </Typography>
                        ))}
                      </Box>

                      {/* Always show explanation when details are shown */}
                      {question.correctExplanation && (
                        <Box
                          sx={{
                            mt: 2,
                            pl: 4,
                            pt: 1,
                            pb: 1,
                            bgcolor: "primary.light",
                            borderRadius: 1,
                            opacity: 0.8,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: "bold", mb: 0.5, color: "black" }}
                          >
                            Giải thích:
                          </Typography>
                          <Typography variant="body2" sx={{ color: "black" }}>
                            {question.correctExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!quizStarted) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ maxWidth: 800, mx: "auto" }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h4" gutterBottom color="primary">
              {activeQuiz.title}
            </Typography>

            <Box sx={{ my: 3, px: 3 }}>
              {activeQuiz.description && (
                <Typography variant="body1" paragraph>
                  {activeQuiz.description}
                </Typography>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 3,
                  my: 4,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "150px",
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Số câu hỏi
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {activeQuiz.questions.length}
                  </Typography>
                </Paper>

                {activeQuiz.timeLimit && (
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: "150px",
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Thời gian
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {activeQuiz.timeLimit} phút
                    </Typography>
                  </Paper>
                )}
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 3 }}>
                Bạn cần hoàn thành tất cả câu hỏi trong thời gian quy định.
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleStartQuiz}
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Bắt đầu làm bài
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, position: "relative" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {activeQuiz.title}
        </Typography>
        {activeQuiz.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {activeQuiz.description}
          </Typography>
        )}
      </Box>

      {/* Responsive sidebar - fixed on desktop, normal flow on mobile */}
      <Box
        sx={{
          ...(isMobile
            ? {
                width: "100%",
                mb: 3,
              }
            : {
                position: "fixed",
                top: 100,
                right: 4,
                width: "240px",
                zIndex: 10,
              }),
        }}
      >
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          {timeRemaining !== null && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Timer color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Thời gian còn lại: {formatTime(timeRemaining)}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              <strong>Tiến độ:</strong>{" "}
              {answers.filter((a) => a !== undefined).length}/
              {activeQuiz.questions.length} câu
            </Typography>
            <Box
              sx={{ mt: 1, height: 8, bgcolor: "grey.200", borderRadius: 1 }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${
                    (answers.filter((a) => a !== undefined).length /
                      activeQuiz.questions.length) *
                    100
                  }%`,
                  bgcolor: "primary.main",
                  borderRadius: 1,
                }}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={
              answers.filter((a) => a !== undefined).length !==
              activeQuiz.questions.length
            }
          >
            Nộp bài
          </Button>
        </Paper>
      </Box>

      <Card
        sx={{
          width: "100%",
        }}
      >
        <CardContent>
          {/* All quiz questions */}
          {activeQuiz.questions.map((question, index) => (
            <Box key={question.id} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1,
                  }}
                >
                  {index + 1}
                </Box>
                {question.questionText}
              </Typography>

              <RadioGroup
                name={`question-${question.id}`}
                value={answers[index] !== undefined ? answers[index] : ""}
                onChange={(e) =>
                  handleAnswerChange(index, parseInt(e.target.value))
                }
                sx={{ ml: 4 }}
              >
                {question.options.map((option, optionIndex) => (
                  <FormControlLabel
                    key={option.id}
                    value={optionIndex}
                    control={<Radio />}
                    label={`${String.fromCharCode(65 + optionIndex)}. ${
                      option.optionText
                    }`}
                  />
                ))}
              </RadioGroup>

              {index < activeQuiz.questions.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuizContent;
