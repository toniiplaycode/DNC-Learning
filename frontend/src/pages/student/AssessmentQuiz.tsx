import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  LinearProgress,
  Stack,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  Timer,
  ArrowBack,
  ArrowForward,
  Check,
  Close,
  Info,
  WarningAmber,
} from "@mui/icons-material";
import CustomContainer from "../../components/common/CustomContainer";

// Sử dụng lại mock data từ ContentDetail.tsx
const mockQuestions = [
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
  {
    id: 2,
    content: "useEffect hook được gọi khi nào?",
    options: [
      "Chỉ khi component mount",
      "Sau mỗi lần render",
      "Khi dependencies thay đổi",
      "Tất cả các trường hợp trên",
    ],
    correctAnswer: 3,
    explanation:
      "useEffect có thể được gọi trong cả 3 trường hợp tùy vào cách sử dụng dependencies.",
  },
  {
    id: 3,
    content: "useMemo hook dùng để làm gì?",
    options: [
      "Tối ưu performance bằng cách cache giá trị",
      "Quản lý state",
      "Xử lý side effects",
      "Tạo ref",
    ],
    correctAnswer: 0,
    explanation:
      "useMemo giúp tối ưu performance bằng cách cache giá trị tính toán.",
  },
  {
    id: 4,
    content: "useCallback hook khác gì với useMemo?",
    options: [
      "useCallback cache function, useMemo cache value",
      "useCallback cache value, useMemo cache function",
      "Không có sự khác biệt",
      "Không thể so sánh",
    ],
    correctAnswer: 0,
    explanation:
      "useCallback được sử dụng để cache function references, trong khi useMemo cache giá trị tính toán.",
  },
  {
    id: 5,
    content: "Custom hooks trong React là gì?",
    options: [
      "Các hooks có sẵn của React",
      "Các hooks được tạo bởi cộng đồng",
      "Các functions sử dụng hooks khác và tuân theo quy tắc hooks",
      "Các components có sử dụng hooks",
    ],
    correctAnswer: 2,
    explanation:
      "Custom hooks là các functions tuân theo quy tắc hooks, tái sử dụng logic giữa các components.",
  },
];

// Mock data cho chi tiết bài kiểm tra
const mockQuizDetails = {
  id: 1,
  title: "Kiểm tra React Hooks cơ bản",
  description:
    "Đánh giá kiến thức về React Hooks và concepts cơ bản trong React",
  duration: 30, // phút
  totalQuestions: mockQuestions.length,
  passingScore: 80,
  course: "React & TypeScript Masterclass",
  instructor: "John Doe",
};

const AssessmentQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(mockQuestions.length).fill(null)
  );
  const [timeRemaining, setTimeRemaining] = useState(
    mockQuizDetails.duration * 60
  ); // Seconds
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [score, setScore] = useState(0);

  // Xử lý đếm ngược thời gian
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format thời gian
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Xử lý chọn đáp án
  const handleAnswerSelect = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  // Di chuyển đến câu tiếp theo
  const handleNextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Quay lại câu trước
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Xử lý nộp bài
  const handleSubmitQuiz = () => {
    // Tính điểm
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === mockQuestions[index].correctAnswer) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / mockQuestions.length) * 100);
    setScore(calculatedScore);
    setQuizCompleted(true);
    setShowResults(true);
  };

  // Kiểm tra xem đã trả lời hết các câu hỏi chưa
  const allQuestionsAnswered = !answers.includes(null);

  // Tính % tiến độ
  const progress = Math.round(
    (answers.filter((a) => a !== null).length / mockQuestions.length) * 100
  );

  return (
    <CustomContainer maxWidth="md">
      {!showResults ? (
        <>
          <Box sx={{ mb: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" fontWeight="bold">
                {mockQuizDetails.title}
              </Typography>

              <Chip
                icon={<Timer />}
                label={formatTime(timeRemaining)}
                color={timeRemaining < 300 ? "error" : "primary"}
                variant="outlined"
              />
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 2, height: 8, borderRadius: 1 }}
            />

            <Typography variant="body2" sx={{ mt: 1 }}>
              Đã trả lời: {answers.filter((a) => a !== null).length}/
              {mockQuestions.length} câu hỏi
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Câu hỏi {currentQuestion + 1}/{mockQuestions.length}
              </Typography>

              <Typography variant="h6" paragraph>
                {mockQuestions[currentQuestion].content}
              </Typography>

              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <RadioGroup
                  value={answers[currentQuestion]}
                  onChange={(e) => handleAnswerSelect(parseInt(e.target.value))}
                >
                  {mockQuestions[currentQuestion].options.map(
                    (option, index) => (
                      <Paper
                        key={index}
                        elevation={1}
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          border: answers[currentQuestion] === index ? 2 : 0,
                          borderColor: "primary.main",
                          overflow: "hidden",
                        }}
                      >
                        <FormControlLabel
                          value={index}
                          control={<Radio />}
                          label={option}
                          sx={{
                            width: "100%",
                            m: 0,
                            p: 2,
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        />
                      </Paper>
                    )
                  )}
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              startIcon={<ArrowBack />}
            >
              Câu trước
            </Button>

            {currentQuestion < mockQuestions.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNextQuestion}
                endIcon={<ArrowForward />}
              >
                Câu tiếp theo
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={() => setOpenConfirmDialog(true)}
                endIcon={<Check />}
                disabled={!allQuestionsAnswered}
              >
                Nộp bài
              </Button>
            )}
          </Box>

          {/* Confirm Submit Dialog */}
          <Dialog
            open={openConfirmDialog}
            onClose={() => setOpenConfirmDialog(false)}
          >
            <DialogTitle>Xác nhận nộp bài</DialogTitle>
            <DialogContent>
              {!allQuestionsAnswered ? (
                <Alert
                  severity="warning"
                  icon={<WarningAmber />}
                  sx={{ mb: 2 }}
                >
                  Bạn chưa trả lời hết tất cả các câu hỏi. Bạn có{" "}
                  {mockQuestions.length -
                    answers.filter((a) => a !== null).length}{" "}
                  câu hỏi chưa trả lời.
                </Alert>
              ) : (
                <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
                  Bạn đã trả lời tất cả các câu hỏi.
                </Alert>
              )}
              <Typography>
                Sau khi nộp bài, bạn sẽ không thể thay đổi câu trả lời. Bạn có
                chắc chắn muốn nộp bài không?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirmDialog(false)}>Hủy</Button>
              <Button
                onClick={handleSubmitQuiz}
                color="primary"
                variant="contained"
              >
                Nộp bài
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        // Hiển thị kết quả
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box textAlign="center" sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Kết quả kiểm tra
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  Điểm số: {score}/100
                </Typography>

                <Chip
                  label={
                    score >= mockQuizDetails.passingScore ? "Đạt" : "Chưa đạt"
                  }
                  color={
                    score >= mockQuizDetails.passingScore ? "success" : "error"
                  }
                  sx={{ mt: 1 }}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Trả lời đúng:{" "}
                  {
                    answers.filter(
                      (a, i) => a === mockQuestions[i].correctAnswer
                    ).length
                  }
                  /{mockQuestions.length} câu hỏi
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Chi tiết câu trả lời
              </Typography>

              {mockQuestions.map((question, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ mt: 0.5 }}>
                      {answers[index] === question.correctAnswer ? (
                        <Check color="success" />
                      ) : (
                        <Close color="error" />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {index + 1}. {question.content}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Bạn đã chọn:{" "}
                        <strong>
                          {answers[index] !== null
                            ? question.options[answers[index]]
                            : "Không trả lời"}
                        </strong>
                      </Typography>

                      {answers[index] !== question.correctAnswer && (
                        <Typography variant="body2" color="success.main">
                          Đáp án đúng:{" "}
                          <strong>
                            {question.options[question.correctAnswer]}
                          </strong>
                        </Typography>
                      )}

                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontSize: "0.9rem", fontStyle: "italic" }}
                      >
                        {question.explanation}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/assessment")}
            >
              Quay lại danh sách
            </Button>

            <Button variant="contained" onClick={() => window.print()}>
              In kết quả
            </Button>
          </Box>
        </Box>
      )}
    </CustomContainer>
  );
};

export default AssessmentQuiz;
