import { Box, Typography, Card, Button, Chip, Stack } from "@mui/material";
import CustomContainer from "../../../components/common/CustomContainer";
import { Assignment, CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

// Mock data cho câu hỏi quiz
const mockQuizData = {
  id: 1,
  title: "Kiểm tra kiến thức React Hooks",
  description:
    "Hãy hoàn thành bài kiểm tra để đánh giá hiểu biết của bạn về React Hooks",
  timeLimit: 30,
  passingScore: 70,
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
        "Function bắt đầu bằng use và có thể tái sử dụng logic",
        "Class components",
        "Thư viện bên thứ 3",
      ],
      correctAnswer: 1,
      explanation:
        "Custom hooks là các function bắt đầu bằng use và cho phép tái sử dụng logic giữa các components.",
    },
  ],
};

// Mock data cho câu trả lời của user
const mockUserAnswers = [1, 2, 0, 0, 1]; // Các lựa chọn của người dùng

const AssessmentQuizResult = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Trong thực tế sẽ lấy từ API
  const quizData = mockQuizData;
  const userAnswers = mockUserAnswers;

  // Tính điểm
  const calculateScore = () => {
    let correctCount = 0;
    quizData.questions.forEach((question, index) => {
      if (question.correctAnswer === userAnswers[index]) {
        correctCount++;
      }
    });
    return Math.round((correctCount / quizData.questions.length) * 100);
  };

  const score = calculateScore();
  const isPassed = score >= quizData.passingScore;

  return (
    <CustomContainer>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Kết quả bài kiểm tra
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {quizData.title}
        </Typography>
      </Box>

      <Card sx={{ mb: 4, p: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="h3"
              color={isPassed ? "success.main" : "error.main"}
            >
              {score}%
            </Typography>
            <Chip
              icon={isPassed ? <CheckCircle /> : <Assignment />}
              label={isPassed ? "Đạt" : "Chưa đạt"}
              color={isPassed ? "success" : "error"}
              sx={{ mt: 1 }}
            />
          </Box>

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Số câu đúng:</strong>{" "}
              {
                quizData.questions.filter(
                  (q, i) => q.correctAnswer === userAnswers[i]
                ).length
              }
              /{quizData.questions.length}
            </Typography>
            <Typography variant="body2">
              <strong>Điểm tối thiểu để đạt:</strong> {quizData.passingScore}%
            </Typography>
            <Typography variant="body2">
              <strong>Thời gian làm bài:</strong> 12:30
            </Typography>
            <Typography variant="body2">
              <strong>Thời gian nộp:</strong> 20/03/2024 14:30
            </Typography>
          </Stack>
        </Stack>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button variant="outlined" onClick={() => navigate("/assessment")}>
            Quay lại danh sách
          </Button>

          {!isPassed && (
            <Button
              variant="contained"
              onClick={() => navigate(`/assessment/quiz/${quizId}`)}
            >
              Làm lại bài kiểm tra
            </Button>
          )}
        </Box>
      </Card>
    </CustomContainer>
  );
};

export default AssessmentQuizResult;
