import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  Quiz,
  Assignment,
  Search,
  Timer,
  MenuBook,
  DocumentScanner,
  School,
  QuestionAnswer,
  DoNotTouch,
  CheckCircle,
  AccessTime,
  Schedule,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CustomContainer from "../../../components/common/CustomContainer";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchQuizzesByStudentAcademic } from "../../../features/quizzes/quizzesSlice";
import { selectQuizzesByStudentAcademic } from "../../../features/quizzes/quizzesSelectors";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { fetchAssignmentsByStudentAcademic } from "../../../features/assignments/assignmentsSlice";
import { selectStudentAcademicAssignments } from "../../../features/assignments/assignmentsSelectors";
import { selectUserAttempt } from "../../../features/quizAttempts/quizAttemptsSelectors";
import { fetchUserAttempts } from "../../../features/quizAttempts/quizAttemptsSlice";
import { formatDateTime } from "../../../utils/formatters";
import { fetchUserSubmissions } from "../../../features/assignment-submissions/assignmentSubmissionsSlice";
import { selectUserSubmissions } from "../../../features/assignment-submissions/assignmentSubmissionsSelectors";
import { QuizType } from "../../../types/quiz.types";

const Assessment = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentAuthUser = useAppSelector(selectCurrentUser);
  const quizzesByStudentAcademic = useAppSelector(
    selectQuizzesByStudentAcademic
  );
  const assignmentsByStudentAcademic = useAppSelector(
    selectStudentAcademicAssignments
  );
  const userAttempts = useAppSelector(selectUserAttempt);
  const userSubmissions = useAppSelector(selectUserSubmissions);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssessments, setFilteredAssessments] = useState<any[]>([]);

  useEffect(() => {
    if (currentAuthUser?.role == "student_academic") {
      if (currentAuthUser?.userStudentAcademic?.id) {
        dispatch(
          fetchQuizzesByStudentAcademic(
            Number(currentAuthUser.userStudentAcademic.id)
          )
        );
        dispatch(
          fetchAssignmentsByStudentAcademic(
            Number(currentAuthUser.userStudentAcademic.id)
          )
        );
      }
      if (currentAuthUser?.id) {
        dispatch(fetchUserAttempts(Number(currentAuthUser.id)));
      }
      dispatch(fetchUserSubmissions());
    }
  }, [currentAuthUser, dispatch]);

  console.log(quizzesByStudentAcademic);

  // Filter assessments when dependencies change
  useEffect(() => {
    if (currentAuthUser?.role == "student_academic") {
      const filtered = [
        ...quizzesByStudentAcademic,
        ...assignmentsByStudentAcademic,
      ].filter((assessment) => {
        const matchesSearch = assessment.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // Kiểm tra nếu quiz này đã được làm
        const isQuizCompleted = !!userAttempts?.find(
          (attempt) => attempt.quizId === assessment.id
        );

        // Kiểm tra nếu bài tập này đã được làm
        const isAssignmentCompleted = userSubmissions?.some(
          (submission) => submission.assignmentId === assessment.id
        );

        // Get quiz status for filtering
        const quizStatus = assessment.quizType
          ? getQuizStatus(assessment)
          : null;

        if (tabValue === 0) return matchesSearch; // Tất cả
        if (tabValue === 1) return assessment.quizType && matchesSearch; // Trắc nghiệm
        if (tabValue === 2) return assessment.assignmentType && matchesSearch; // Bài tập
        if (tabValue === 3)
          return (isQuizCompleted || isAssignmentCompleted) && matchesSearch; // Đã hoàn thành
        if (tabValue === 4)
          return (
            assessment.quizType &&
            quizStatus?.status === "upcoming" &&
            matchesSearch
          ); // Sắp diễn ra
        if (tabValue === 5)
          return (
            assessment.quizType &&
            quizStatus?.status === "active" &&
            matchesSearch
          ); // Đang diễn ra
        if (tabValue === 6)
          return (
            assessment.quizType &&
            quizStatus?.status === "ended" &&
            matchesSearch
          ); // Đã kết thúc

        return false;
      });

      setFilteredAssessments(filtered);
      // Tạo danh sách các quiz đã làm
    } else if (currentAuthUser?.role == "student") {
      setFilteredAssessments([]);
    }
  }, [
    quizzesByStudentAcademic,
    assignmentsByStudentAcademic,
    tabValue,
    searchQuery,
    currentAuthUser,
    userAttempts,
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Add this helper function to sort attempts by date
  const getQuizAttempts = (attempts: any[], quizId: string | number) => {
    return attempts
      .filter((attempt) => attempt.quizId === quizId)
      .sort(
        (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
      );
  };

  // Helper to check if there is a saved quiz state for a quiz
  const getSavedQuizState = (quizId: number | string) => {
    try {
      const saved = localStorage.getItem("saved_quiz_state");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.quizId && String(parsed.quizId) === String(quizId)) {
        // Kiểm tra nếu quiz có thời gian kết thúc và đã hết thời gian
        const quiz = quizzesByStudentAcademic.find((q) => q.id === quizId);
        if (quiz && quiz.endTime) {
          const now = new Date();
          const endTime = new Date(quiz.endTime);
          if (now >= endTime) {
            // Tự động clear saved quiz state khi đã hết thời gian
            localStorage.removeItem("saved_quiz_state");
            return null;
          }
        }

        // Nếu còn thời gian và chưa nộp
        if (parsed.timeRemaining > 0) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Helper để format thời gian mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Helper to check if quiz is currently available
  const isQuizAvailable = (quiz: any) => {
    if (!quiz.quizType) return { available: true }; // Not a quiz, always available

    const now = new Date();

    // Check start time
    if (quiz.startTime) {
      const startTime = new Date(quiz.startTime);
      if (now < startTime) {
        return {
          available: false,
          reason: "Chưa đến thời gian bắt đầu",
          time: startTime,
        };
      }
    }

    // Check end time
    if (quiz.endTime) {
      const endTime = new Date(quiz.endTime);
      if (now > endTime) {
        return {
          available: false,
          reason: "Đã hết thời gian làm bài",
          time: endTime,
        };
      }
    }

    return { available: true, time: null };
  };

  // Helper to get quiz status
  const getQuizStatus = (quiz: any) => {
    if (!quiz.quizType) return null; // Not a quiz

    const now = new Date();

    if (quiz.startTime && quiz.endTime) {
      const startTime = new Date(quiz.startTime);
      const endTime = new Date(quiz.endTime);

      if (now < startTime) {
        return { status: "upcoming", label: "Sắp diễn ra", color: "warning" };
      } else if (now >= startTime && now <= endTime) {
        return { status: "active", label: "Đang diễn ra", color: "success" };
      } else {
        return { status: "ended", label: "Đã kết thúc", color: "error" };
      }
    } else if (quiz.startTime) {
      const startTime = new Date(quiz.startTime);
      if (now < startTime) {
        return { status: "upcoming", label: "Sắp diễn ra", color: "warning" };
      } else {
        return { status: "active", label: "Đang diễn ra", color: "success" };
      }
    } else if (quiz.endTime) {
      const endTime = new Date(quiz.endTime);
      if (now > endTime) {
        return { status: "ended", label: "Đã kết thúc", color: "error" };
      } else {
        return { status: "active", label: "Đang diễn ra", color: "success" };
      }
    }

    return { status: "active", label: "Đang diễn ra", color: "success" };
  };

  return (
    <CustomContainer maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Trắc nghiệm & bài tập lớp học thuật{" "}
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight="bold"
          mt={1}
        >
          {currentAuthUser?.userStudentAcademic?.academicClass?.className} -{" "}
          {currentAuthUser?.userStudentAcademic?.academicClass?.classCode}
        </Typography>
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm bài trắc nghiệm hoặc bài tập..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Tất cả" icon={<DocumentScanner />} iconPosition="start" />
          <Tab label="Trắc nghiệm" icon={<Quiz />} iconPosition="start" />
          <Tab label="Bài tập" icon={<Assignment />} iconPosition="start" />
          <Tab label="Đã hoàn thành" icon={<School />} iconPosition="start" />
          <Tab label="Sắp diễn ra" icon={<Timer />} iconPosition="start" />
          <Tab
            label="Đang diễn ra"
            icon={<CheckCircle />}
            iconPosition="start"
          />
          <Tab label="Đã kết thúc" icon={<DoNotTouch />} iconPosition="start" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredAssessments.map((assessment) => (
          <Grid item xs={12} md={6} lg={4} key={assessment.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Hiển thị thông tin bài làm tạm nếu có */}
                {assessment.quizType && getSavedQuizState(assessment.id) && (
                  <Box
                    sx={{
                      mb: 1,
                      p: 1,
                      bgcolor: "warning.light",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Timer fontSize="small" color="warning" />
                    <Typography
                      variant="body2"
                      color="warning.dark"
                      fontWeight="bold"
                    >
                      Đang làm dở:
                    </Typography>
                    <Typography variant="body2" color="warning.dark">
                      {
                        getSavedQuizState(assessment.id).answers.filter(
                          (a: any) => a !== undefined && a !== null
                        ).length
                      }
                      /{getSavedQuizState(assessment.id).answers.length} câu,
                      còn{" "}
                      {formatTime(
                        getSavedQuizState(assessment.id).timeRemaining
                      )}
                    </Typography>
                  </Box>
                )}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  {assessment.quizType ? (
                    <Stack direction="row" spacing={1}>
                      <Quiz color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Bài Trắc nghiệm
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Assignment color="info" />
                      <Typography variant="body2" color="text.secondary">
                        Bài Tập
                      </Typography>
                    </Stack>
                  )}

                  {/* Display quiz status chip */}
                  {assessment.quizType &&
                    (() => {
                      const status = getQuizStatus(assessment);
                      if (status) {
                        const getStatusIcon = () => {
                          switch (status.status) {
                            case "upcoming":
                              return <Timer fontSize="small" />;
                            case "active":
                              return <CheckCircle fontSize="small" />;
                            case "ended":
                              return <DoNotTouch fontSize="small" />;
                            default:
                              return <CheckCircle fontSize="small" />;
                          }
                        };

                        const getStatusStyle = () => {
                          switch (status.status) {
                            case "upcoming":
                              return {
                                bgcolor: "warning.light",
                                color: "white",
                                border: "1px solid",
                              };
                            case "active":
                              return {
                                bgcolor: "success.light",
                                color: "white",
                                border: "1px solid",
                              };
                            case "ended":
                              return {
                                bgcolor: "error.light",
                                color: "white",
                                border: "1px solid",
                              };
                            default:
                              return {
                                bgcolor: "success.light",
                                color: "white",
                                border: "1px solid",
                              };
                          }
                        };

                        return (
                          <Chip
                            icon={getStatusIcon()}
                            label={status.label}
                            size="small"
                            sx={{
                              ...getStatusStyle(),
                              fontWeight: "bold",
                              fontSize: "0.75rem",
                              height: "28px",
                              "& .MuiChip-icon": {
                                color: "inherit",
                              },
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                </Stack>

                <Typography variant="h6" gutterBottom>
                  {assessment.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {assessment.description}
                </Typography>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <MenuBook fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {assessment.academicClass?.className}
                    </Typography>
                  </Stack>

                  {assessment.quizType && (
                    <Stack direction="row" spacing={1}>
                      <School fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Loại:{" "}
                        {(() => {
                          switch (assessment.quizType) {
                            case QuizType.PRACTICE:
                              return "Luyện tập (trọng số 0.1)";
                            case QuizType.HOMEWORK:
                              return "Bài tập (trọng số 0.2)";
                            case QuizType.MIDTERM:
                              return "Giữa kì (trọng số 0.3)";
                            case QuizType.FINAL:
                              return "Cuối kì (trọng số 0.6)";
                            default:
                              return "Không xác định";
                          }
                        })()}
                      </Typography>
                    </Stack>
                  )}

                  {assessment.quizType && (
                    <Stack direction="row" spacing={1}>
                      <Timer fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {assessment?.timeLimit} phút
                      </Typography>
                    </Stack>
                  )}

                  {assessment.quizType && (
                    <Stack direction="row" spacing={1}>
                      <QuestionAnswer fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {assessment.questions?.length} câu hỏi
                      </Typography>
                    </Stack>
                  )}

                  {assessment.quizType && (
                    <Stack direction="row" spacing={1}>
                      <CheckCircle fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Số lần làm tối đa:{" "}
                        {assessment.attemptsAllowed || "Không giới hạn"}
                      </Typography>
                    </Stack>
                  )}

                  {assessment.quizType && assessment.startTime && (
                    <Stack direction="row" spacing={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Bắt đầu: {formatDateTime(assessment.startTime)}
                      </Typography>
                    </Stack>
                  )}

                  {assessment.quizType && assessment.endTime && (
                    <Stack direction="row" spacing={1}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Kết thúc: {formatDateTime(assessment.endTime)}
                      </Typography>
                    </Stack>
                  )}

                  {assessment.quizType && (
                    <>
                      {userAttempts?.some(
                        (attempt) => attempt.quizId === assessment.id
                      ) && (
                        <>
                          <Divider />
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              color="primary"
                              gutterBottom
                            >
                              Các lần làm bài:
                            </Typography>
                            <Stack spacing={1}>
                              {getQuizAttempts(userAttempts, assessment.id).map(
                                (attempt, index) => (
                                  <Box
                                    key={attempt.id}
                                    sx={{
                                      pt: 1,
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      bgcolor: "background.default",
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Typography variant="body2">
                                      Lần {index + 1}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="primary"
                                      fontWeight="bold"
                                    >
                                      {attempt.score !== null
                                        ? `Điểm: ${attempt.score}/100`
                                        : "-------"}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {attempt.endTime !== null
                                        ? formatDateTime(attempt.endTime)
                                        : "Chưa hoàn thành"}
                                    </Typography>
                                  </Box>
                                )
                              )}
                            </Stack>
                          </Box>
                        </>
                      )}
                    </>
                  )}
                </Stack>

                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: "auto" }}
                >
                  {userSubmissions?.some(
                    (submission) => submission.assignmentId === assessment.id
                  ) && (
                    <Typography variant="body2" sx={{ fontSize: "12px" }}>
                      Đã làm:{" "}
                      {formatDateTime(
                        userSubmissions.find(
                          (submission) =>
                            submission.assignmentId === assessment.id
                        )?.submittedAt || new Date().toISOString()
                      )}
                    </Typography>
                  )}
                </Typography>
              </CardContent>

              <CardActions>
                {assessment.quizType && getSavedQuizState(assessment.id) ? (
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    onClick={() =>
                      navigate(`/assessment/quiz/${assessment.id}`)
                    }
                  >
                    Tiếp tục làm
                  </Button>
                ) : userAttempts?.some(
                    (attempt) => attempt.quizId === assessment.id
                  ) ||
                  userSubmissions?.some(
                    (submission) => submission.assignmentId === assessment.id
                  ) ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() =>
                      navigate(
                        `/assessment/${
                          assessment.quizType ? "quiz" : "assignment"
                        }/${assessment.id}`
                      )
                    }
                  >
                    Xem kết quả
                  </Button>
                ) : (
                  (() => {
                    const availability = isQuizAvailable(assessment);
                    if (assessment.quizType && !availability.available) {
                      return (
                        <Button
                          fullWidth
                          variant="contained"
                          disabled
                          sx={{ bgcolor: "grey.400", color: "grey.600" }}
                        >
                          {availability.reason}
                        </Button>
                      );
                    }
                    return (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() =>
                          navigate(
                            `/assessment/${
                              assessment.quizType ? "quiz" : "assignment"
                            }/${assessment.id}`
                          )
                        }
                      >
                        Bắt đầu làm
                      </Button>
                    );
                  })()
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}

        {filteredAssessments.length === 0 && (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              width: "100%",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy Bài trắc nghiệm hoặc bài tập nào
            </Typography>
          </Box>
        )}
      </Grid>
    </CustomContainer>
  );
};

export default Assessment;
