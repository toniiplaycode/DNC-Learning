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
import { Timer, CheckCircle, Cancel, PlayArrow } from "@mui/icons-material";
import {
  createAttempt,
  fetchAttemptByUserIdAndQuizId,
  fetchQuizById,
  fetchQuizzesByLesson,
  fetchUserAttempts,
  submitQuizResponsesAndUpdateAttempt,
} from "../../../features/quizzes/quizzesSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectCurrentAttempt,
  selectCurrentQuiz,
  selectLessonQuizzes,
  selectUserAttempts,
} from "../../../features/quizzes/quizzesSelectors";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface QuizContentProps {
  quizId: number;
  lessonId: number;
  setShowDiscussion: (show: boolean) => void;
  onComplete: (score: number) => void;
}

const QuizContent: React.FC<QuizContentProps> = ({
  quizId,
  lessonId,
  setShowDiscussion,
  onComplete,
}) => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { pathname } = useLocation();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const lessonQuizzes = useAppSelector(selectLessonQuizzes);
  const quizById = useAppSelector(selectCurrentQuiz);
  const userAttempts = useAppSelector(selectUserAttempts);
  const currentAttempt = useAppSelector(selectCurrentAttempt);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeQuiz, setActiveQuiz] = useState();
  // State
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [activeShowExplanations, setActiveShowExplanations] = useState(false);
  const [isAssessmentQuiz, setIsAssessmentQuiz] = useState(false);

  // Tạo state cho lần thử gần nhất
  const [latestAttempt, setLatestAttempt] = useState(null);

  useEffect(() => {
    // Fetch quizzes when the component mounts
    if (quizId) {
      dispatch(fetchQuizById(quizId));
    } else if (lessonId) {
      dispatch(fetchQuizzesByLesson(lessonId));
    }
    if (pathname.includes("assessment/quiz")) {
      setIsAssessmentQuiz(true);
    }
  }, [currentUser, dispatch, location, lessonId, quizId]);

  // useEffect riêng để fetch user attempts
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserAttempts(Number(currentUser?.id)));
    }
  }, [currentUser, dispatch, id, pathname]);

  // useEffect để lấy lần thử gần nhất, dùng cho quiz assessment bên trang assessment
  useEffect(() => {
    if (userAttempts?.length > 0 && isAssessmentQuiz) {
      // Lọc các attempts cho quiz hiện tại (nếu quizById có)
      if (quizById) {
        const quizAttempts = userAttempts.filter(
          (attempt) => attempt.quizId === quizById.id
        );

        if (quizAttempts.length > 0) {
          // Sắp xếp attempts theo thời gian tạo giảm dần (mới nhất lên đầu)
          const sortedAttempts = [...quizAttempts].sort((a, b) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          // Lấy lần thử gần nhất
          setLatestAttempt(sortedAttempts[0]);
        }
      } else {
        // Nếu không có quizById, giữ nguyên logic cũ
        setLatestAttempt(userAttempts[0]);
      }
    }
  }, [userAttempts, isAssessmentQuiz, quizById]);

  // useEffect để lấy quiz hiện tại, dùng cho quiz bên trang course trong lesson
  useEffect(() => {
    if (quizId) {
      setActiveQuiz(quizById);
    } else if (lessonId) {
      setActiveQuiz(lessonQuizzes);

      // Kiểm tra nếu có userAttempts và lessonQuizzes
      if (userAttempts?.length > 0 && lessonQuizzes) {
        // Lọc các attempts cho quiz hiện tại
        const quizAttempts = userAttempts.filter(
          (attempt) => attempt.quizId === lessonQuizzes.id
        );

        if (quizAttempts.length > 0) {
          // Sắp xếp attempts theo thời gian tạo giảm dần (mới nhất lên đầu)
          const sortedAttempts = [...quizAttempts].sort((a, b) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          // Lấy lần thử gần nhất
          setLatestAttempt(sortedAttempts[0]);
        }
      }
    }
  }, [currentUser, dispatch, location, quizById, lessonQuizzes, userAttempts]);

  useEffect(() => {
    // Initialize time limit if the quiz has one and has been started
    if (activeQuiz && activeQuiz.timeLimit && !timeRemaining && quizStarted) {
      setTimeRemaining(activeQuiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [activeQuiz, timeRemaining, quizStarted]);

  useEffect(() => {
    if (activeQuiz && activeQuiz?.showExplanation === 0) {
      setActiveShowExplanations(false);
    }
    if (activeQuiz && activeQuiz?.showExplanation === 1) {
      setActiveShowExplanations(true);
    }
  }, [activeQuiz]);

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

  const handleStartQuizAttempt = () => {
    dispatch(createAttempt(Number(activeQuiz?.id))).then(() => {
      dispatch(
        fetchAttemptByUserIdAndQuizId({
          userId: Number(currentUser?.id),
          quizId: Number(activeQuiz?.id),
        })
      );
    });

    setQuizStarted(true);
  };

  const handleAnswerChange = (questionIndex: number, optionId: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionId;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (!activeQuiz) return;

    let correctCount = 0;

    const questionIds =
      activeQuiz?.questions?.map((question) => Number(question.id)) || [];

    console.log({
      questionIds,
      responses: answers,
      attemptId: currentAttempt?.id,
    });

    dispatch(
      submitQuizResponsesAndUpdateAttempt({
        questionIds,
        responses: answers,
        attemptId: Number(currentAttempt?.id),
      })
    ).then(() => {
      // dispatch(fetchAttemptByUserIdAndQuizId({
      //   userId: Number(currentUser?.id),
      //   quizId: Number(activeQuiz?.id),
      // })
      // );
    });

    // answers.forEach((answer, index) => {
    //   const question = activeQuiz?.questions?.[index];
    //   const correctOption = question?.options?.findIndex(
    //     (option) => option.isCorrect
    //   );
    //   if (answer === correctOption) {
    //     correctCount++;
    //   }
    // });

    // const finalScore = Math.round(
    //   (correctCount / activeQuiz?.questions?.length) * 100
    // );
    // setScore(finalScore);
    // setQuizSubmitted(true);
    // if (!isAssessmentQuiz) {
    //   setShowDiscussion(true);
    // }
    // onComplete(finalScore);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Thêm useEffect để xử lý khi latestAttempt thay đổi
  useEffect(() => {
    if (latestAttempt && latestAttempt.status === "completed") {
      setQuizSubmitted(true);
      setScore(parseFloat(latestAttempt.score));
      if (!isAssessmentQuiz) {
        setShowDiscussion(true);
      }

      // Tạo mảng answers từ responses của latestAttempt
      const userAnswers = [];

      if (latestAttempt.responses && activeQuiz?.questions) {
        activeQuiz.questions.forEach((question) => {
          const response = latestAttempt.responses.find(
            (r) => r.questionId === question.id
          );

          if (response && response.selectedOption) {
            // Tìm index của option đã chọn trong danh sách options của câu hỏi
            const questionInQuiz = activeQuiz.questions.find(
              (q) => q.id === question.id
            );
            if (questionInQuiz && questionInQuiz.options) {
              const optionIndex = questionInQuiz.options.findIndex(
                (opt) => opt.id === response.selectedOption.id
              );
              userAnswers.push(optionIndex);
            }
          } else {
            userAnswers.push(-1); // Không có câu trả lời
          }
        });

        setAnswers(userAnswers);
      }
    }
  }, [latestAttempt, activeQuiz]);

  // Tách phần render ra khỏi phần kiểm tra latestAttempt
  if (
    latestAttempt &&
    latestAttempt.status === "completed" &&
    quizSubmitted &&
    activeShowExplanations
  ) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Kết quả bài làm gần nhất
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
                color={
                  score >= (activeQuiz?.passingScore || 70)
                    ? "success.main"
                    : "error.main"
                }
              >
                {latestAttempt?.responses
                  ? latestAttempt.responses.filter(
                      (response) => parseFloat(response.score) > 0
                    ).length
                  : answers.filter((answer) => {
                      // Đếm số câu trả lời đúng dựa vào mảng answers
                      const questionIndex = activeQuiz?.questions?.findIndex(
                        (_, idx) => idx === answer
                      );
                      return (
                        questionIndex !== -1 && questionIndex !== undefined
                      );
                    }).length}
                /{activeQuiz?.questions?.length} câu
              </Typography>
              <Typography variant="subtitle1">
                {latestAttempt?.responses
                  ? (latestAttempt.responses.filter(
                      (r) => parseFloat(r.score) > 0
                    ).length /
                      activeQuiz?.questions?.length) *
                      100 >=
                    50
                    ? "Đạt"
                    : "Chưa đạt"
                  : (activeQuiz?.questions?.filter(
                      (_, i) =>
                        answers[i] ===
                        activeQuiz.questions?.[i].options?.findIndex(
                          (o) => o.isCorrect
                        )
                    ).length /
                      activeQuiz?.questions?.length) *
                      100 >=
                    50
                  ? "Đạt"
                  : "Chưa đạt"}
              </Typography>
            </Box>

            {activeShowExplanations && (
              <>
                <Typography variant="h6" gutterBottom>
                  Chi tiết câu trả lời:
                </Typography>

                {activeQuiz?.questions?.map((question, index) => {
                  const userAnswer =
                    answers[index] !== undefined ? answers[index] : -1;
                  const correctOptionIndex = question?.options?.findIndex(
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
                        {question?.options?.map((option, optionIndex) => (
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

            {/* Thêm nút làm lại nếu cần */}
            {activeQuiz &&
              activeQuiz.attemptsAllowed >
                (userAttempts?.filter((a) => a.quizId === activeQuiz.id)
                  ?.length || 0) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Reset state để làm bài mới
                    setQuizSubmitted(false);
                    setQuizStarted(false);
                    setAnswers([]);
                    setScore(0);
                    setTimeRemaining(null);
                  }}
                  sx={{ mt: 2 }}
                >
                  Làm lại bài
                </Button>
              )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!activeQuiz) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Đang tải bài quiz...</Typography>
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
                    {activeQuiz?.questions?.length}
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
              onClick={handleStartQuizAttempt}
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
            {/* Add detailed counts */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
                mb: 2,
                fontSize: "0.875rem",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    mr: 0.5,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Đã chọn: {answers.filter((a) => a !== undefined).length}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "grey.400",
                    mr: 0.5,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Chưa chọn:{" "}
                  {activeQuiz?.questions?.length -
                    answers.filter((a) => a !== undefined).length}
                </Typography>
              </Box>
            </Box>

            {/* Question number indicators */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Câu hỏi:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {activeQuiz?.questions?.map((_, index) => {
                  const isAnswered = answers[index] !== undefined;
                  return (
                    <Box
                      key={index}
                      sx={{
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        bgcolor: isAnswered ? "primary.main" : "grey.200",
                        color: isAnswered ? "white" : "text.secondary",
                        fontWeight: isAnswered ? "bold" : "normal",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: isAnswered ? "primary.dark" : "grey.300",
                        },
                      }}
                      onClick={() => {
                        // Scroll to the question with 20px top margin
                        const questionElement = document.getElementById(
                          `question-${index}`
                        );
                        if (questionElement) {
                          const rect = questionElement.getBoundingClientRect();
                          const scrollTop =
                            window.pageYOffset ||
                            document.documentElement.scrollTop;
                          const targetPosition = scrollTop + rect.top - 120;
                          window.scrollTo({
                            top: targetPosition,
                            behavior: "smooth",
                          });
                        }
                      }}
                    >
                      {index + 1}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ height: 8, bgcolor: "grey.200", borderRadius: 1 }}>
              <Box
                sx={{
                  height: "100%",
                  width: `${
                    (answers.filter((a) => a !== undefined).length /
                      activeQuiz?.questions?.length) *
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
              activeQuiz?.questions?.length
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
          {activeQuiz?.questions?.map((question, index) => (
            <Box key={question.id} sx={{ mb: 4 }} id={`question-${index}`}>
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
                {question?.options?.map((option, optionIndex) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={`${String.fromCharCode(65 + optionIndex)}. ${
                      option.optionText
                    }`}
                  />
                ))}
              </RadioGroup>

              {index < activeQuiz?.questions?.length - 1 && (
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
