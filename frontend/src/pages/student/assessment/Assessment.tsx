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
  const [filteredAssessments, setFilteredAssessments] = useState([]);

  useEffect(() => {
    if (currentAuthUser?.role == "student_academic") {
      dispatch(
        fetchQuizzesByStudentAcademic(currentAuthUser?.userStudentAcademic?.id)
      );
      dispatch(
        fetchAssignmentsByStudentAcademic(
          currentAuthUser?.userStudentAcademic?.id
        )
      );
      dispatch(fetchUserAttempts(currentAuthUser?.id));
      dispatch(fetchUserSubmissions());
    }
  }, [currentAuthUser, dispatch]);

  console.log(userAttempts);

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

        if (tabValue === 0) return matchesSearch;
        if (tabValue === 1) return assessment.quizType && matchesSearch;
        if (tabValue === 2) return assessment.assignmentType && matchesSearch;
        if (tabValue === 3)
          return (isQuizCompleted || isAssignmentCompleted) && matchesSearch;

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

  return (
    <CustomContainer maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Trắc nghiệm & bài tập
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

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Tất cả" icon={<DocumentScanner />} iconPosition="start" />
          <Tab label="Trắc nghiệm" icon={<Quiz />} iconPosition="start" />
          <Tab label="Bài tập" icon={<Assignment />} iconPosition="start" />
          <Tab label="Đã hoàn thành" icon={<School />} iconPosition="start" />
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
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  {assessment.quizType ? (
                    <Quiz color="primary" />
                  ) : (
                    <Assignment color="primary" />
                  )}
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
                    <>
                      {userAttempts?.some(
                        (attempt) => attempt.quizId === assessment.id
                      ) && (
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
                                    Điểm: {attempt.score}/100
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatDateTime(attempt.endTime)}
                                  </Typography>
                                </Box>
                              )
                            )}
                          </Stack>
                        </Box>
                      )}
                    </>
                  )}
                </Stack>

                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: "auto" }}
                >
                  {userAttempts?.some(
                    (attempt) => attempt.quizId === assessment.id
                  )
                    ? `Hoàn thành: ${formatDateTime(
                        userAttempts.find(
                          (quiz_attempt) =>
                            quiz_attempt.quizId === assessment.id
                        )?.endTime || new Date().toISOString()
                      )}`
                    : `Hạn: ${
                        assessment?.dueDate
                          ? formatDateTime(assessment?.dueDate)
                          : "Chưa có hạn"
                      }`}

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
                {userAttempts?.some(
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
