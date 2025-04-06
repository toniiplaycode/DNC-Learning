import { Box, Typography, Card, Button, Chip, Stack } from "@mui/material";
import CustomContainer from "../../../components/common/CustomContainer";
import { Assignment, CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { fetchAttemptById } from "../../../features/quizAttempts/quizAttemptsSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectCurrentAttempt } from "../../../features/quizAttempts/quizAttemptsSelectors";
import { formatDateTime } from "../../../utils/formatters";

const AssessmentQuizResult = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const currentQuizAttempt = useAppSelector(selectCurrentAttempt);

  useEffect(() => {
    dispatch(fetchAttemptById(Number(id)));
  }, [id, dispatch]);

  // Chờ đến khi dữ liệu được tải
  if (!currentQuizAttempt || !currentQuizAttempt.quiz) {
    return (
      <CustomContainer>
        <Typography>Đang tải dữ liệu...</Typography>
      </CustomContainer>
    );
  }

  const quizData = currentQuizAttempt.quiz;

  // Tính điểm dựa trên dữ liệu thực
  const calculateScore = () => {
    if (!currentQuizAttempt.responses || !quizData.questions) return 0;

    // Lấy tổng điểm từ responses
    const totalScore = parseFloat(currentQuizAttempt.score);

    // Tính điểm tối đa
    const maxScore = quizData.questions.reduce(
      (sum, question) => sum + question.points,
      0
    );

    // Tính phần trăm điểm
    return Math.round((totalScore / maxScore) * 100);
  };

  const score = calculateScore();
  const isPassed = score >= quizData.passingScore;
  // Tính thời gian làm bài (phút:giây)
  const calculateDuration = () => {
    if (!currentQuizAttempt.startTime || !currentQuizAttempt.endTime)
      return "N/A";

    const startTime = new Date(currentQuizAttempt.startTime).getTime();
    const endTime = new Date(currentQuizAttempt.endTime).getTime();

    const durationInSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Lấy số câu đúng
  const getCorrectAnswersCount = () => {
    if (!currentQuizAttempt.responses) return 0;

    return currentQuizAttempt.responses.filter(
      (response) => parseFloat(response.score) > 0
    ).length;
  };

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
              <strong>Số câu đúng:</strong> {getCorrectAnswersCount()}/
              {quizData.questions.length}
            </Typography>
            <Typography variant="body2">
              <strong>Điểm tối thiểu để đạt:</strong> {quizData.passingScore}%
            </Typography>
            <Typography variant="body2">
              <strong>Thời gian làm bài:</strong> {calculateDuration()}
            </Typography>
            <Typography variant="body2">
              <strong>Thời gian nộp:</strong>{" "}
              {formatDateTime(currentQuizAttempt.endTime)}
            </Typography>
          </Stack>
        </Stack>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button variant="outlined" onClick={() => navigate("/assessment")}>
            Quay lại danh sách
          </Button>

          {!isPassed && quizData.attemptsAllowed > 1 && (
            <Button
              variant="contained"
              onClick={() => navigate(`/assessment/quiz/${quizData.id}`)}
            >
              Làm lại bài kiểm tra
            </Button>
          )}
        </Box>
      </Card>

      {/* Chi tiết câu trả lời */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
        Chi tiết câu trả lời
      </Typography>

      {quizData.questions.map((question, index) => {
        // Tìm response tương ứng với question
        const response = currentQuizAttempt.responses?.find(
          (r) => r.questionId === question.id
        );

        // Tìm option đã chọn
        const selectedOption = question.options?.find(
          (opt) => opt.id === response?.selectedOptionId
        );

        // Tìm option đúng
        const correctOption = question.options?.find((opt) => opt.isCorrect);

        // Kiểm tra xem câu trả lời có đúng không
        const isCorrect = selectedOption?.isCorrect || false;

        return (
          <Card key={question.id} sx={{ mb: 3, p: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Câu hỏi {index + 1}: {question.questionText}
            </Typography>

            <Box sx={{ mt: 2 }}>
              {question.options?.map((option) => (
                <Box
                  key={option.id}
                  sx={{
                    p: 1,
                    pl: 2,
                    mb: 1,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    bgcolor:
                      option.id === response?.selectedOptionId
                        ? option.isCorrect
                          ? "success.light"
                          : "error.light"
                        : option.isCorrect
                        ? "success.light"
                        : "background.paper",
                  }}
                >
                  <Typography variant="body2">{option.optionText}</Typography>
                  {option.id === response?.selectedOptionId && (
                    <Box sx={{ ml: 1 }}>
                      {option.isCorrect ? (
                        <CheckCircle fontSize="small" color="success" />
                      ) : (
                        <Assignment fontSize="small" color="error" />
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>

            {quizData.showExplanation === 1 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Giải thích:
                </Typography>
                <Typography variant="body2">
                  {question.correctExplanation}
                </Typography>
              </Box>
            )}

            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Typography variant="body2">
                <strong>Điểm: </strong>
                {parseFloat(response?.score || "0")}/{question.points} điểm
              </Typography>
              <Chip
                label={isCorrect ? "Đúng" : "Sai"}
                color={isCorrect ? "success" : "error"}
                size="small"
              />
            </Box>
          </Card>
        );
      })}
    </CustomContainer>
  );
};

export default AssessmentQuizResult;
