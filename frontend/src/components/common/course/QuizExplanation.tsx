import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import { CheckCircle, Cancel, Help } from "@mui/icons-material";

interface Question {
  id: number;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizExplanationProps {
  questions: Question[];
  userAnswers: number[];
  score: number;
  passingScore: number;
}

const QuizExplanation: React.FC<QuizExplanationProps> = ({
  questions,
  userAnswers,
  score,
  passingScore,
}) => {
  const correctAnswers = userAnswers.filter(
    (answer, index) => answer === questions[index].correctAnswer
  ).length;

  return (
    <Box>
      {/* Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={1}>
                <Typography
                  variant="h4"
                  color={score >= passingScore ? "success.main" : "error.main"}
                >
                  {score.toFixed(1)}%
                </Typography>
                <Chip
                  icon={score >= passingScore ? <CheckCircle /> : <Cancel />}
                  label={score >= passingScore ? "Đạt" : "Chưa đạt"}
                  color={score >= passingScore ? "success" : "error"}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Typography variant="body1">
                  Số câu đúng: {correctAnswers}/{questions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Điểm yêu cầu: {passingScore}%
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Explanations */}
      <Stack spacing={3}>
        {questions.map((question, index) => {
          const isCorrect = userAnswers[index] === question.correctAnswer;

          return (
            <Card key={question.id} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  {/* Question Header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      size="small"
                      icon={isCorrect ? <CheckCircle /> : <Cancel />}
                      label={isCorrect ? "Đúng" : "Sai"}
                      color={isCorrect ? "success" : "error"}
                    />
                    <Typography variant="subtitle1">
                      Câu {index + 1}: {question.content}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Answer Comparison */}
                  <Stack spacing={1}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Đáp án của bạn:
                      </Typography>
                      <Typography
                        variant="body1"
                        color={isCorrect ? "success.main" : "error.main"}
                      >
                        {userAnswers[index] !== undefined
                          ? question.options[userAnswers[index]]
                          : "Chưa trả lời"}
                      </Typography>
                    </Box>
                    {!isCorrect && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Đáp án đúng:
                        </Typography>
                        <Typography variant="body1" color="success.main">
                          {question.options[question.correctAnswer]}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Explanation */}
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Help fontSize="small" color="info" />
                      Giải thích:
                    </Typography>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {question.explanation}
                    </Alert>
                  </Box>

                  {/* All Options Analysis */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Phân tích các lựa chọn:
                    </Typography>
                    <Stack spacing={1}>
                      {question.options.map((option, optIndex) => (
                        <Box
                          key={optIndex}
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor:
                              optIndex === question.correctAnswer
                                ? "success.lighter"
                                : optIndex === userAnswers[index] && !isCorrect
                                ? "error.lighter"
                                : "background.default",
                            border: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="body2">
                            {optIndex === question.correctAnswer && (
                              <CheckCircle
                                color="success"
                                sx={{
                                  fontSize: 16,
                                  mr: 1,
                                  verticalAlign: "middle",
                                }}
                              />
                            )}
                            {option}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default QuizExplanation;
