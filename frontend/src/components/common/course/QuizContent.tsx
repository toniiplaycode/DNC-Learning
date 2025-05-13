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
  Tooltip,
} from "@mui/material";
import { Quiz as QuizIcon } from "@mui/icons-material";
import {
  Timer,
  CheckCircle,
  Cancel,
  PlayArrow,
  Info,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
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
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createNotification } from "../../../features/notifications/notificationsSlice";
import { AcademicClass } from "../../../types/academic-class.types";
import { Instructor } from "../../../features/user_instructors/instructorsApiSlice";

// Add this interface for better type safety
interface QuizAnswer {
  quizId: number;
  answers: number[];
}

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
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [activeShowExplanations, setActiveShowExplanations] = useState(false);
  const [isAssessmentQuiz, setIsAssessmentQuiz] = useState(false);
  // Thêm state mới để lưu thứ tự hiển thị ngẫu nhiên của câu hỏi
  const [randomQuestionOrder, setRandomQuestionOrder] = useState<number[]>([]);
  // Tạo state cho lần thử gần nhất
  const [latestAttempt, setLatestAttempt] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(() => {
    // Check if there's a completed attempt for this quiz
    if (
      latestAttempt &&
      latestAttempt.status === "completed" &&
      latestAttempt.quizId === activeQuiz?.id
    ) {
      return true;
    }
    return false;
  });

  // Replace the simple answers state with a more specific one
  const [currentAnswers, setCurrentAnswers] = useState<QuizAnswer>(() => ({
    quizId: 0,
    answers: [],
  }));

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

  const handleAttempt = (userAttempts: any) => {
    if (quizById) {
      const quizAttempts = userAttempts.filter(
        (attempt: any) => attempt.quizId === quizById.id
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
  };

  // useEffect để lấy lần thử gần nhất, dùng cho quiz assessment bên trang assessment
  useEffect(() => {
    if (userAttempts?.length > 0 && isAssessmentQuiz) {
      // Lọc các attempts cho quiz hiện tại (nếu quizById có)
      handleAttempt(userAttempts);
    }
  }, [userAttempts, isAssessmentQuiz, quizById, quizSubmitted]);

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

  // Reset answers when quiz changes
  useEffect(() => {
    if (activeQuiz?.id) {
      // Only reset if it's a different quiz
      if (currentAnswers.quizId !== activeQuiz.id) {
        setCurrentAnswers({
          quizId: activeQuiz.id,
          answers: new Array(activeQuiz.questions?.length).fill(undefined),
        });
      }
    }
  }, [activeQuiz?.id]);

  const handleAnswerChange = (questionIndex: number, optionId: number) => {
    setCurrentAnswers((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[questionIndex] = optionId;
      return {
        ...prev,
        answers: newAnswers,
      };
    });
  };

  const handleStartQuizAttempt = () => {
    dispatch(createAttempt(Number(activeQuiz?.id))).then(() => {
      dispatch(
        fetchAttemptByUserIdAndQuizId({
          userId: Number(currentUser?.id),
          quizId: Number(activeQuiz?.id),
        })
      ).then((response) => {
        console.log(response.payload);
      });
    });

    setQuizStarted(true);
  };

  const handleSubmit = async () => {
    if (!activeQuiz || currentAnswers.quizId !== activeQuiz.id) return;

    try {
      const questionIds =
        activeQuiz.questions?.map((question) => Number(question.id)) || [];

      const submitResult = await dispatch(
        submitQuizResponsesAndUpdateAttempt({
          questionIds,
          responses: currentAnswers.answers,
          attemptId: Number(currentAttempt?.id),
        })
      ).unwrap();

      await dispatch(fetchUserAttempts(Number(currentUser?.id)));

      // Send notification to instructor
      if (submitResult && activeQuiz) {
        // Get instructor ID based on quiz type
        const instructorId = activeQuiz.academicClass
          ? activeQuiz.academicClass.instructors[0]?.instructor?.userId
          : activeQuiz.lesson?.section?.course?.instructor?.userId;

        if (instructorId) {
          const notificationData = {
            userIds: [instructorId],
            title: "Bài trắc nghiệm mới được nộp",
            content: `${currentUser?.username} đã nộp bài trắc nghiệm "${activeQuiz.title}" với kết quả ${submitResult.score}%`,
            type: "quiz",
          };

          try {
            await dispatch(createNotification(notificationData));
          } catch (error) {
            console.error("Error sending notification:", error);
          }
        }
      }

      // Clear and explicit set of submission state
      setQuizSubmitted(true);

      // Show discussion only for non-assessment quizzes
      if (!isAssessmentQuiz) {
        setShowDiscussion(true);
      }

      // Show success message
      toast.success("Nộp bài thành công!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Có lỗi xảy ra khi nộp bài");
    }
  };

  console.log(activeQuiz);

  const handleRetakeQuiz = () => {
    if (activeQuiz?.id) {
      setCurrentAnswers({
        quizId: activeQuiz.id,
        answers: new Array(activeQuiz.questions?.length).fill(undefined),
      });
    }
    setQuizSubmitted(false);
    setQuizStarted(false);
    setScore(0);
    setTimeRemaining(null);
    setRandomQuestionOrder([]); // Reset random order
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
    if (latestAttempt && activeQuiz) {
      const isCompletedAttempt =
        latestAttempt.status === "completed" &&
        Number(latestAttempt.quizId) === Number(activeQuiz.id);

      if (isCompletedAttempt) {
        setQuizSubmitted(true);
        setScore(parseFloat(latestAttempt.score));

        if (!isAssessmentQuiz) {
          setShowDiscussion(true);
        }

        // Handle setting answers from latest attempt
        const userAnswers =
          activeQuiz.questions?.map((question) => {
            const response = latestAttempt.responses?.find(
              (r) => r.questionId === question.id
            );

            if (response?.selectedOption) {
              return (
                question.options?.findIndex(
                  (opt) => opt.id === response.selectedOption.id
                ) ?? -1
              );
            }
            return -1;
          }) ?? [];

        setCurrentAnswers((prev) => ({
          ...prev,
          answers: userAnswers,
        }));
      } else {
        setQuizSubmitted(false);
      }
    }
  }, [latestAttempt, activeQuiz, isAssessmentQuiz]);

  // Thêm hàm helper để format thời gian
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút ${seconds} giây`;
    } else if (minutes > 0) {
      return `${minutes} phút ${seconds} giây`;
    } else {
      return `${seconds} giây`;
    }
  };

  // Thêm useEffect để tạo thứ tự ngẫu nhiên khi quiz bắt đầu
  useEffect(() => {
    if (activeQuiz?.questions && quizStarted) {
      if (activeQuiz.random === 1) {
        // Tạo mảng index từ 0 đến length-1
        const indices = Array.from(
          { length: activeQuiz.questions.length },
          (_, i) => i
        );
        // Shuffle mảng indices
        const shuffled = [...indices].sort(() => Math.random() - 0.5);
        setRandomQuestionOrder(shuffled);
      } else {
        // Nếu không random, sử dụng thứ tự tuần tự
        setRandomQuestionOrder(
          Array.from({ length: activeQuiz.questions.length }, (_, i) => i)
        );
      }
    }
  }, [activeQuiz?.questions, quizStarted, activeQuiz?.random]);

  // Replace the existing empty state
  if (!activeQuiz) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          bgcolor: "background.paper",
          borderRadius: 2,
        }}
      >
        <QuizIcon
          sx={{
            fontSize: 64,
            color: "text.disabled",
            mb: 2,
            opacity: 0.5,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Chưa có bài trắc nghiệm
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ maxWidth: 400 }}
        >
          Hiện tại chưa có bài trắc nghiệm nào được tạo cho phần này. Vui lòng
          quay lại sau.
        </Typography>
      </Box>
    );
  }

  // Tách phần render ra khỏi phần kiểm tra latestAttempt
  if (
    activeQuiz &&
    latestAttempt &&
    latestAttempt.status === "completed" &&
    Number(latestAttempt.quizId) === Number(activeQuiz.id) &&
    quizSubmitted
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
                  score >= (activeQuiz.passingScore || 70)
                    ? "success.main"
                    : "error.main"
                }
              >
                {latestAttempt?.responses
                  ? latestAttempt.responses.filter(
                      (response) => parseFloat(response.score) > 0
                    ).length
                  : currentAnswers.answers.filter((answer) => {
                      // Đếm số câu trả lời đúng dựa vào mảng answers
                      const questionIndex = activeQuiz.questions?.findIndex(
                        (_, idx) => idx === answer
                      );
                      return (
                        questionIndex !== -1 && questionIndex !== undefined
                      );
                    }).length}
                /{activeQuiz.questions?.length} câu
              </Typography>
              {latestAttempt && latestAttempt.score !== undefined ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    {latestAttempt.score >= (activeQuiz.passingScore || 50) ? (
                      <>
                        <Typography variant="subtitle1" color="success.main">
                          Đạt
                        </Typography>
                        <CheckCircle color="success" />
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle1" color="error.main">
                          Chưa đạt
                        </Typography>
                        <Cancel color="error" />
                      </>
                    )}
                  </Box>

                  {/* Hiển thị thông tin thời gian */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: "background.paper",
                      p: 2,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      width: "100%",
                      maxWidth: 400,
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Thời gian làm bài
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Bắt đầu:
                        </Typography>
                        <Typography variant="body2">
                          {formatDateTime(latestAttempt.startTime)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Kết thúc:
                        </Typography>
                        <Typography variant="body2">
                          {formatDateTime(latestAttempt.endTime)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Tổng thời gian:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {calculateDuration(
                            latestAttempt.startTime,
                            latestAttempt.endTime
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Thêm phần hiển thị trạng thái giải thích */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: activeQuiz.showExplanation
                        ? "success.light"
                        : "warning.light",
                      color: activeQuiz.showExplanation
                        ? "success.dark"
                        : "warning.dark",
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: activeQuiz.showExplanation
                        ? "success.main"
                        : "warning.main",
                    }}
                  >
                    {activeQuiz.showExplanation ? (
                      <>
                        <Visibility fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          Giải thích đáp án sẽ được hiển thị sau khi nộp bài
                        </Typography>
                      </>
                    ) : (
                      <>
                        <VisibilityOff fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          Giải thích đáp án đã bị ẩn
                        </Typography>
                      </>
                    )}
                  </Box>

                  {/* Thêm tooltip giải thích chi tiết */}
                  <Tooltip
                    title={
                      activeQuiz.showExplanation
                        ? "Học viên sẽ thấy giải thích cho mỗi câu hỏi sau khi nộp bài"
                        : "Giảng viên đã tắt hiển thị giải thích cho bài quiz này"
                    }
                    arrow
                    placement="top"
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 1,
                        cursor: "help",
                      }}
                    >
                      <Info fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {activeQuiz.showExplanation
                          ? "Giải thích sẽ hiển thị cho tất cả câu hỏi"
                          : "Giải thích sẽ không được hiển thị"}
                      </Typography>
                    </Box>
                  </Tooltip>
                </>
              ) : (
                ""
              )}
            </Box>

            {/* Thêm nút làm lại nếu cần */}
            {activeQuiz &&
              activeQuiz.attemptsAllowed >
                (userAttempts?.filter((a) => a.quizId === activeQuiz.id)
                  ?.length || 0) && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRetakeQuiz}
                  >
                    Làm lại bài
                  </Button>
                </Box>
              )}

            {activeShowExplanations && (
              <>
                <Typography variant="h6" gutterBottom>
                  Chi tiết câu trả lời:
                </Typography>

                {activeQuiz.questions?.map((question, index) => {
                  const userAnswer =
                    currentAnswers.answers[index] !== undefined
                      ? currentAnswers.answers[index]
                      : -1;
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
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Màn hình bắt đầu
  if (activeQuiz && !quizStarted) {
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

  // Nếu đã bắt đầu làm nhưng chưa nộp/chưa hiển thị kết quả
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
                  Đã chọn:{" "}
                  {currentAnswers.answers.filter((a) => a !== undefined).length}
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
                    currentAnswers.answers.filter((a) => a !== undefined)
                      .length}
                </Typography>
              </Box>
            </Box>

            {/* Question number indicators */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Câu hỏi:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {activeQuiz?.questions &&
                  randomQuestionOrder.length > 0 &&
                  activeQuiz.questions.map((_, originalIndex) => {
                    // Lấy index từ randomQuestionOrder hoặc sử dụng originalIndex nếu không random
                    const displayIndex =
                      activeQuiz.random === 1
                        ? randomQuestionOrder[originalIndex]
                        : originalIndex;
                    const question = activeQuiz.questions[displayIndex];

                    if (!question) return null;

                    const isAnswered =
                      currentAnswers.answers[displayIndex] !== undefined;
                    return (
                      <Box
                        key={displayIndex}
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
                          const questionElement = document.getElementById(
                            `question-${displayIndex}`
                          );
                          if (questionElement) {
                            const rect =
                              questionElement.getBoundingClientRect();
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
                        {originalIndex + 1}
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
                    (currentAnswers.answers.filter((a) => a !== undefined)
                      .length /
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
              currentAnswers.answers.filter((a) => a !== undefined).length !==
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
          {activeQuiz?.questions &&
            randomQuestionOrder.length > 0 &&
            activeQuiz.questions.map((_, originalIndex) => {
              // Lấy index từ randomQuestionOrder hoặc sử dụng originalIndex nếu không random
              const displayIndex =
                activeQuiz.random === 1
                  ? randomQuestionOrder[originalIndex]
                  : originalIndex;
              const question = activeQuiz.questions[displayIndex];

              if (!question) return null;

              return (
                <Box
                  key={question.id}
                  sx={{ mb: 4 }}
                  id={`question-${displayIndex}`}
                >
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
                      {originalIndex + 1}
                    </Box>
                    {question.questionText}
                  </Typography>

                  <RadioGroup
                    name={`question-${question.id}`}
                    value={
                      currentAnswers.answers[displayIndex] !== undefined
                        ? currentAnswers.answers[displayIndex]
                        : ""
                    }
                    onChange={(e) =>
                      handleAnswerChange(displayIndex, parseInt(e.target.value))
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

                  {originalIndex < activeQuiz.questions.length - 1 && (
                    <Divider sx={{ my: 2 }} />
                  )}
                </Box>
              );
            })}
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuizContent;
