import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Grid,
  LinearProgress,
  Menu,
  Tooltip,
  ListItemIcon,
  Badge,
  Collapse,
} from "@mui/material";
import {
  Search,
  Visibility,
  Download,
  Email,
  Assignment,
  CheckCircle,
  Cancel,
  Person,
  ArrowBack,
  Quiz,
  Add,
  MoreVert,
  FilterList,
  Edit,
  Delete,
  HourglassEmpty,
  School,
  MenuBook,
  FilterAlt,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import DialogAddEditQuiz from "../../components/instructor/course/DialogAddEditQuiz";
import {
  fetchAttemptsByQuizId,
  fetchInstructorAttempts,
  fetchQuizzesByInstructor,
  deleteQuiz,
} from "../../features/quizzes/quizzesSlice";
import {
  selectInstructorAttempts,
  selectInstructorQuizzes,
  selectQuizAttempts,
} from "../../features/quizzes/quizzesSelectors";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { formatDateTime } from "../../utils/formatters";
import { toast } from "react-toastify";

// Thêm interface để định nghĩa kiểu dữ liệu
interface QuizAttempt {
  id: number;
  studentId: number;
  studentName: string;
  avatar: string;
  score: number;
  timeTaken: number;
  submittedDate: string;
  status: string;
  studentType: string;
  studentCode?: string;
  className?: string;
  faculty?: string;
  answers: Array<{
    question: number;
    answer: number;
    correct: boolean;
  }>;
  quizId?: number;
  quizTitle?: string;
  courseName?: string;
  timeSpent?: number;
}

// Định nghĩa interface cho Quiz
interface Quiz {
  id: string;
  lessonId: string | null;
  academicClassId: string | null;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  attemptsAllowed: number;
  quizType: string;
  showExplanation: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    title: string;
    section: {
      course: {
        id: string;
        title: string;
      };
    };
  };
  academicClass?: {
    id: string;
    classCode: string;
    className: string;
    instructors: Array<{
      id: string;
      instructorId: string;
    }>;
  };
  questions: Array<{
    id: string;
    questionText: string;
    questionType: string;
    correctExplanation: string;
    points: number;
    orderNumber: number;
    options: Array<{
      id: string;
      optionText: string;
      isCorrect: boolean;
      orderNumber: number;
    }>;
  }>;
}

// Add this interface at the top with other interfaces
interface TabPanelProps {
  children?: React.ReactNode;
  value: string;
  type: string;
}

const InstructorQuizs = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const instructorQuizzes = useAppSelector(selectInstructorQuizzes);
  const quizAttempts = useAppSelector(selectQuizAttempts);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [studentTypeFilter, setStudentTypeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [tabValue, setTabValue] = useState(0);
  const [openAttemptDetails, setOpenAttemptDetails] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(
    null
  );
  const [openAddQuizModal, setOpenAddQuizModal] = useState(false);
  // Add at the top of your component with other states
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  // Add new state for answer filter
  const [answerFilter, setAnswerFilter] = useState("all"); // 'all' | 'correct' | 'incorrect'
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);

  useEffect(() => {
    // Fetch both quizzes and attempts
    dispatch(fetchQuizzesByInstructor(currentUser.userInstructor.id));
    dispatch(fetchInstructorAttempts(currentUser.userInstructor.id));
  }, [dispatch, currentUser]);

  const courses = useMemo(() => {
    if (!instructorQuizzes) return [];

    // Get all courses from quizzes
    const allCourses = instructorQuizzes.reduce((acc: any[], quiz: Quiz) => {
      if (quiz.lesson?.section.course) {
        acc.push({
          id: quiz.lesson.section.course.id,
          title: quiz.lesson.section.course.title,
        });
      }
      return acc;
    }, []);

    // Remove duplicates using Set and map
    return Array.from(
      new Set(allCourses.map((course) => JSON.stringify(course)))
    ).map((str) => JSON.parse(str));
  }, [instructorQuizzes]);

  // Add this near other useMemo hooks
  const academicClasses = useMemo(() => {
    if (!instructorQuizzes) return [];

    // Get all classes from quizzes
    const allClasses = instructorQuizzes.reduce((acc: any[], quiz: Quiz) => {
      if (quiz.academicClass) {
        acc.push({
          id: quiz.academicClass.id,
          classCode: quiz.academicClass.classCode,
          className: quiz.academicClass.className,
        });
      }
      return acc;
    }, []);

    // Remove duplicates using Set
    return Array.from(
      new Set(allClasses.map((cls) => JSON.stringify(cls)))
    ).map((str) => JSON.parse(str));
  }, [instructorQuizzes]);

  // Xử lý click vào quiz
  const handleQuizClick = (quiz: Quiz) => {
    console.log("Quiz clicked:", quiz);
    dispatch(fetchAttemptsByQuizId(quiz.id));
    setSelectedQuiz(quiz);
  };

  // Add filter logic function
  const getFilteredResponses = (responses: any[]) => {
    if (answerFilter === "all") return responses;

    return responses.filter((response) =>
      answerFilter === "correct"
        ? Number(response.score) > 0
        : Number(response.score) === 0
    );
  };

  // Xử lý quay lại danh sách quiz
  const handleBackToList = () => {
    setSelectedQuiz(null);
  };

  // Xử lý xem chi tiết bài làm
  const handleViewAttempt = (attempt: QuizAttempt) => {
    setSelectedAttempt(attempt);
    setOpenAttemptDetails(true);
  };

  // Lọc danh sách học viên theo tìm kiếm và bộ lọc
  const getFilteredAttempts = () => {
    if (!quizAttempts) return [];

    // Group attempts by user
    const attemptsByUser = quizAttempts.reduce((acc, attempt) => {
      const userId = attempt.user.id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(attempt);
      return acc;
    }, {} as { [key: string]: typeof quizAttempts });

    // Get latest attempt for each user
    const latestAttempts = Object.values(attemptsByUser).map((userAttempts) => {
      // Sort by endTime descending to get the most recent attempt
      return userAttempts.sort(
        (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
      )[0];
    });

    // Apply filters
    return latestAttempts.filter((attempt) => {
      const matchesSearch = (
        attempt.user?.userStudent?.fullName ||
        attempt.user?.userStudentAcademic?.fullName ||
        attempt.user?.username ||
        ""
      )
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "passed" &&
          attempt.score >= selectedQuiz.passingScore) ||
        (filterStatus === "failed" &&
          attempt.score < selectedQuiz.passingScore);

      return matchesSearch && matchesStatus;
    });
  };

  // Update the component to use filtered quiz attempts
  const filteredAttempts = getFilteredAttempts();

  // Update QuizStatistics component to use real data
  const QuizStatistics = ({ quiz }: { quiz: Quiz }) => {
    const attempts = quizAttempts || [];
    const passedStudents = attempts.filter(
      (attempt) => Number(attempt.score) >= quiz.passingScore
    ).length;
    const failedStudents = attempts.length - passedStudents;
    const passRate =
      attempts.length > 0 ? (passedStudents / attempts.length) * 100 : 0;

    // Calculate average score
    const averageScore =
      attempts.length > 0
        ? attempts.reduce((sum, attempt) => sum + Number(attempt.score), 0) /
          attempts.length
        : 0;

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Điểm trung bình
              </Typography>
              <Typography variant="h4" color="primary">
                {averageScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trên thang điểm 100
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tỷ lệ đạt
              </Typography>
              <Typography variant="h4" color="success.main">
                {passRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {passedStudents}/{attempts.length} học viên
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Số bài làm
              </Typography>
              <Typography variant="h4">{attempts.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số bài làm
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setQuizToEdit(quiz);
    setOpenAddQuizModal(true);
  };

  // Add getFilteredQuizzes function inside component
  const getFilteredQuizzes = () => {
    if (!instructorQuizzes) return [];

    return instructorQuizzes.filter((quiz) => {
      // Filter by search query
      const matchesSearch =
        !searchQuery ||
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by student type
      const matchesType =
        studentTypeFilter === "all" ||
        (studentTypeFilter === "student" && quiz.lessonId) ||
        (studentTypeFilter === "student_academic" && quiz.academicClassId);

      // Filter by course/class if selected
      const matchesCourse =
        filterCourse === "all" ||
        quiz.lesson?.section.course.id === filterCourse ||
        quiz.academicClass?.id === filterCourse;

      return matchesSearch && matchesType && matchesCourse;
    });
  };

  // Render danh sách quiz
  if (!selectedQuiz) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Quản lý bài trắc nghiệm
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                placeholder="Tìm kiếm Bài trắc nghiệm..."
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {studentTypeFilter == "student" ? (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Khóa học</InputLabel>
                  <Select
                    value={filterCourse}
                    label="Khóa học"
                    onChange={(e) => setFilterCourse(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả khóa học</MenuItem>
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : studentTypeFilter == "student_academic" ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Lớp</InputLabel>
                    <Select
                      value={classFilter}
                      label="Lớp"
                      onChange={(e) => setClassFilter(e.target.value)}
                    >
                      <MenuItem value="all">Tất cả các lớp</MenuItem>
                      {academicClasses.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.className} - {cls.classCode}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAddQuizModal(true)}
                    startIcon={<Add />}
                    sx={{
                      minWidth: "300px",
                    }}
                  >
                    Tạo Bài trắc nghiệm mới
                  </Button>
                </>
              ) : (
                <></>
              )}
            </Stack>
            <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
              <Tabs
                value={studentTypeFilter}
                onChange={(e, newValue) => setStudentTypeFilter(newValue)}
                variant="fullWidth"
              >
                <Tab
                  icon={<FilterAlt fontSize="small" />}
                  iconPosition="start"
                  label="Tất cả "
                  value="all"
                  sx={{ width: "210px" }}
                />
                <Tab
                  icon={<Person fontSize="small" />}
                  iconPosition="start"
                  label="Học viên bên ngoài"
                  value="student"
                  sx={{ width: "210px" }}
                />
                <Tab
                  icon={<School fontSize="small" />}
                  iconPosition="start"
                  label="Sinh viên trường"
                  value="student_academic"
                  sx={{ width: "210px" }}
                />
              </Tabs>
            </Box>

            {/* Update QuizList usage */}
            <QuizList
              quizzes={getFilteredQuizzes()}
              onQuizClick={handleQuizClick}
              onEditClick={handleEditQuiz}
            />
          </CardContent>
        </Card>

        {!quizToEdit?.lessonId && (
          <DialogAddEditQuiz
            open={openAddQuizModal}
            onClose={() => {
              setOpenAddQuizModal(false);
              setQuizToEdit(null);
            }}
            quizToEdit={quizToEdit}
            editMode={!!quizToEdit}
            additionalInfo={{
              targetType: "academic",
              className: classFilter !== "all" ? classFilter : "Tất cả các lớp",
            }}
          />
        )}

        {quizToEdit?.lessonId && (
          <DialogAddEditQuiz
            open={openAddQuizModal}
            onClose={() => {
              setOpenAddQuizModal(false);
              setQuizToEdit(null);
            }}
            quizToEdit={quizToEdit}
            editMode={!!quizToEdit}
          />
        )}
      </Box>
    );
  }

  // Helper function to format duration
  const formatDuration = (startTime: string, endTime: string) => {
    const duration = new Date(
      new Date(endTime).getTime() - new Date(startTime).getTime()
    );
    const hours = Math.floor(duration.getTime() / (1000 * 60 * 60));
    const minutes = duration.getUTCMinutes();
    const seconds = duration.getUTCSeconds();

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Render chi tiết Bài trắc nghiệm và danh sách học viên làm bài
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={handleBackToList}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          {selectedQuiz.title}
        </Typography>
      </Stack>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">
                {selectedQuiz.lessonId ? (
                  <>Khóa học: {selectedQuiz.lesson?.section.course.title}</>
                ) : (
                  <>
                    Lớp học: {selectedQuiz.academicClass?.className} -{" "}
                    {selectedQuiz.academicClass?.classCode}
                  </>
                )}
              </Typography>
              <Typography variant="body2">
                Số câu hỏi: {selectedQuiz.questions.length}
              </Typography>
              <Typography variant="body2">
                Điểm đạt: {selectedQuiz.passingScore}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" align="right">
                Ngày tạo: {formatDateTime(selectedQuiz.createdAt)}
              </Typography>
            </Grid>
          </Grid>

          {/* Thống kê */}
          <QuizStatistics quiz={selectedQuiz} />

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Person sx={{ mr: 1 }} />
                  Danh sách học viên
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Quiz sx={{ mr: 1 }} />
                  Câu hỏi
                </Box>
              }
            />
          </Tabs>

          {/* Tab 1: Danh sách học viên */}
          {tabValue === 0 && (
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <TextField
                  placeholder="Tìm kiếm học viên..."
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Trạng thái"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="passed">Đạt</MenuItem>
                    <MenuItem value="failed">Không đạt</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Học viên</TableCell>
                      {studentTypeFilter === "student_academic" && (
                        <>
                          <TableCell>Mã SV</TableCell>
                          <TableCell>Lớp</TableCell>
                        </>
                      )}
                      <TableCell>Bài trắc nghiệm</TableCell>
                      <TableCell>Khóa học</TableCell>
                      <TableCell>Thời gian làm</TableCell>
                      <TableCell>Thời gian nộp</TableCell>
                      <TableCell>Kết quả</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAttempts.length > 0 ? (
                      filteredAttempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Avatar
                                src={attempt.user.avatarUrl}
                                sx={{ width: 30, height: 30 }}
                              >
                                {attempt.user.username[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {attempt.user.userStudentAcademic?.fullName ||
                                    attempt.user.userStudent?.fullName ||
                                    attempt.user.username}
                                  {attempt.user.userStudentAcademic && (
                                    <Chip
                                      size="small"
                                      icon={<School fontSize="small" />}
                                      label="SV"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    cursor: "pointer",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedUser(
                                      expandedUser === attempt.user.id
                                        ? null
                                        : attempt.user.id
                                    );
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {
                                      quizAttempts.filter(
                                        (a) => a.user.id === attempt.user.id
                                      ).length
                                    }{" "}
                                    lần thử
                                  </Typography>
                                  <IconButton size="small">
                                    {expandedUser === attempt.user.id ? (
                                      <KeyboardArrowUp fontSize="small" />
                                    ) : (
                                      <KeyboardArrowDown fontSize="small" />
                                    )}
                                  </IconButton>
                                </Box>
                              </Box>
                            </Stack>
                            <Collapse in={expandedUser === attempt.user.id}>
                              <Box sx={{ pl: 5, pt: 1 }}>
                                {quizAttempts
                                  .filter((a) => a.user.id === attempt.user.id)
                                  .sort(
                                    (a, b) =>
                                      new Date(a.endTime).getTime() -
                                      new Date(b.endTime).getTime()
                                  )
                                  .map((attempt, index) => (
                                    <Box
                                      key={attempt.id}
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        py: 0.5,
                                      }}
                                    >
                                      <Typography variant="caption">
                                        Lần {index + 1}:{" "}
                                        {formatDuration(
                                          attempt.startTime,
                                          attempt.endTime
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color={
                                          Number(attempt.score) >=
                                          selectedQuiz.passingScore
                                            ? "success.main"
                                            : "error.main"
                                        }
                                        fontWeight="medium"
                                      >
                                        {attempt.score}/100
                                      </Typography>
                                    </Box>
                                  ))}
                              </Box>
                            </Collapse>
                          </TableCell>
                          {studentTypeFilter === "student_academic" && (
                            <>
                              <TableCell>
                                {attempt.user.userStudentAcademic
                                  ?.studentCode || "-"}
                              </TableCell>
                              <TableCell>
                                {attempt.user.userStudentAcademic?.academicClass
                                  ?.className || "-"}
                              </TableCell>
                            </>
                          )}
                          <TableCell>{selectedQuiz.title}</TableCell>
                          <TableCell>
                            {selectedQuiz.lesson?.section.course.title ||
                              selectedQuiz.academicClass?.className +
                                " - " +
                                selectedQuiz.academicClass?.classCode}
                          </TableCell>
                          <TableCell>
                            {formatDuration(attempt.startTime, attempt.endTime)}
                          </TableCell>
                          <TableCell>
                            {new Date(attempt.endTime).toLocaleString("vi-VN")}
                          </TableCell>
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="subtitle2">
                                  Lịch sử làm bài:
                                </Typography>
                                {quizAttempts
                                  .filter((a) => a.user.id === attempt.user.id)
                                  .sort(
                                    (a, b) =>
                                      new Date(b.endTime).getTime() -
                                      new Date(a.endTime).getTime()
                                  )
                                  .map((a, i) => (
                                    <Typography key={i} variant="body2">
                                      Lần {i + 1}: {a.score}/100 (
                                      {new Date(a.endTime).toLocaleString(
                                        "vi-VN"
                                      )}
                                      )
                                    </Typography>
                                  ))}
                              </Box>
                            }
                          >
                            <TableCell>
                              <Typography
                                variant="body2"
                                color={
                                  Number(attempt.score) >=
                                  selectedQuiz.passingScore
                                    ? "success.main"
                                    : "error.main"
                                }
                                fontWeight="bold"
                              >
                                {attempt.score}/100
                              </Typography>
                            </TableCell>
                          </Tooltip>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewAttempt(attempt)}
                            >
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={
                            studentTypeFilter === "student_academic" ? 9 : 7
                          }
                          sx={{ py: 8 }} // Add more vertical padding
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            {/* Add an icon */}
                            <Assignment
                              sx={{
                                fontSize: 64,
                                color: "text.disabled",
                                opacity: 0.5,
                              }}
                            />

                            {/* Main message */}
                            <Typography variant="h6" color="text.secondary">
                              Không tìm thấy dữ liệu
                            </Typography>

                            {/* Optional helper text */}
                            <Typography
                              variant="body2"
                              color="text.disabled"
                              align="center"
                              sx={{ maxWidth: 300 }}
                            >
                              Hiện chưa có học viên nào làm bài trắc nghiệm này
                              hoặc không tìm thấy kết quả phù hợp với bộ lọc
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Tab 2: Câu hỏi */}
          {tabValue === 1 && (
            <List>
              {selectedQuiz.questions.map((question, index) => (
                <React.Fragment key={question.id}>
                  {index > 0 && <Divider />}
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="subtitle1">
                            Câu {index + 1}: {question.questionText}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {question.options.map((option) => (
                            <Box
                              key={option.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 0.5,
                                p: 1,
                                borderRadius: 1,
                                bgcolor: option.isCorrect
                                  ? "success.light"
                                  : "background.paper",
                              }}
                            >
                              {option.isCorrect ? (
                                <CheckCircle
                                  color="success"
                                  fontSize="small"
                                  sx={{ mr: 1 }}
                                />
                              ) : (
                                <div style={{ width: 26, marginRight: 8 }} />
                              )}
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={
                                    option.isCorrect ? "bold" : "normal"
                                  }
                                >
                                  {option.optionText}
                                </Typography>
                              </Box>
                              {option.isCorrect && (
                                <Chip
                                  size="small"
                                  color="success"
                                  label="Đáp án đúng"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          ))}
                          {question.correctExplanation && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 1.5,
                                bgcolor: "info.lighter",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                <strong>Giải thích:</strong>{" "}
                                {question.correctExplanation}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
      {/* Chi tiết bài làm dialog */}
      <Dialog
        open={openAttemptDetails}
        onClose={() => setOpenAttemptDetails(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAttempt && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>{selectedAttempt.user.username[0]}</Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedAttempt.user.userStudentAcademic?.fullName ||
                      selectedAttempt.user.userStudent?.fullName ||
                      selectedAttempt.user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nộp lúc:{" "}
                    {new Date(selectedAttempt.endTime).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="subtitle1" gutterBottom>
                        Điểm số
                      </Typography>
                      <Typography
                        variant="h3"
                        color={
                          Number(selectedAttempt.score) >=
                          selectedQuiz.passingScore
                            ? "success.main"
                            : "error.main"
                        }
                        fontWeight="bold"
                      >
                        {selectedAttempt.score}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Điểm đạt: {selectedQuiz.passingScore}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="subtitle1" gutterBottom>
                        Trạng thái
                      </Typography>
                      <Chip
                        label={
                          Number(selectedAttempt.score) >=
                          selectedQuiz.passingScore
                            ? "Đạt"
                            : "Không đạt"
                        }
                        color={
                          Number(selectedAttempt.score) >=
                          selectedQuiz.passingScore
                            ? "success"
                            : "error"
                        }
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="subtitle1" gutterBottom>
                        Thời gian làm bài
                      </Typography>
                      <Typography variant="h5">
                        {formatDuration(
                          selectedAttempt.startTime,
                          selectedAttempt.endTime
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">Chi tiết câu trả lời</Typography>

                  <FormControl size="small" sx={{ width: 200 }}>
                    <InputLabel>Hiển thị</InputLabel>
                    <Select
                      value={answerFilter}
                      label="Hiển thị"
                      onChange={(e) => setAnswerFilter(e.target.value)}
                    >
                      <MenuItem value="all">Tất cả câu hỏi</MenuItem>
                      <MenuItem value="correct">Câu trả lời đúng</MenuItem>
                      <MenuItem value="incorrect">Câu trả lời sai</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <List>
                  {getFilteredResponses(selectedAttempt.responses).map(
                    (response) => (
                      <React.Fragment key={response.id}>
                        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {Number(response.score) > 0 ? (
                                  <CheckCircle color="success" />
                                ) : (
                                  <Cancel color="error" />
                                )}
                                <Typography variant="subtitle1">
                                  Câu {response.question.orderNumber}:{" "}
                                  {response.question.questionText}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                {response.question.options.map((option) => (
                                  <Box
                                    key={option.id}
                                    sx={{
                                      p: 1,
                                      my: 0.5,
                                      borderRadius: 1,
                                      bgcolor:
                                        option.id ===
                                        response.selectedOption?.id
                                          ? option.isCorrect
                                            ? "success.light"
                                            : "error.light"
                                          : option.isCorrect
                                          ? "success.light"
                                          : "background.default",
                                    }}
                                  >
                                    <Stack
                                      direction="row"
                                      justifyContent="space-between"
                                      alignItems="center"
                                    >
                                      <Typography variant="body2">
                                        {option.optionText}
                                      </Typography>
                                      <Stack direction="row" spacing={1}>
                                        {option.id ===
                                          response.selectedOption?.id && (
                                          <Chip
                                            size="small"
                                            label="Đã chọn"
                                            color={
                                              option.isCorrect
                                                ? "success"
                                                : "error"
                                            }
                                          />
                                        )}
                                        {option.isCorrect && (
                                          <Chip
                                            size="small"
                                            label="Đáp án đúng"
                                            color="success"
                                          />
                                        )}
                                      </Stack>
                                    </Stack>
                                  </Box>
                                ))}

                                {response.question.correctExplanation && (
                                  <Box
                                    sx={{
                                      mt: 1,
                                      p: 1.5,
                                      bgcolor: "info.lighter",
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Typography variant="body2">
                                      <strong>Giải thích:</strong>{" "}
                                      {response.question.correctExplanation}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    )
                  )}
                </List>

                {/* Add summary of filtered results */}
                <Box sx={{ mt: 2, textAlign: "right" }}>
                  <Typography variant="body2" color="text.secondary">
                    Hiển thị{" "}
                    {getFilteredResponses(selectedAttempt.responses).length}{" "}
                    trong số {selectedAttempt.responses.length} câu hỏi
                  </Typography>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenAttemptDetails(false)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

interface QuizListProps {
  quizzes: Quiz[];
  onQuizClick: (quiz: Quiz) => void;
  onEditClick: (quiz: Quiz) => void;
}

const QuizList = ({ quizzes, onQuizClick, onEditClick }: QuizListProps) => {
  const dispatch = useAppDispatch();
  const instructorAttempts = useAppSelector(selectInstructorAttempts);
  const currentUser = useAppSelector(selectCurrentUser);

  // Fetch attempts when component mounts
  useEffect(() => {
    dispatch(fetchInstructorAttempts(currentUser.userInstructor.id));
  }, [dispatch, currentUser]);

  // Function to count attempts for a specific quiz
  const getQuizAttemptCount = (quizId: string) => {
    if (!instructorAttempts) return 0;

    return instructorAttempts.filter(
      (attempt) =>
        String(attempt.quizId) === String(quizId) &&
        attempt.status === "completed"
    ).length;
  };

  // Add this state
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    type: "",
    id: "",
  });

  // Add these handlers
  const handleDeleteClick = (quiz: Quiz) => {
    setDeleteDialog({
      open: true,
      type: "quiz",
      id: quiz.id,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const result = await dispatch(deleteQuiz(deleteDialog.id)).unwrap();

      if (result?.error === "Rejected") {
        toast.error(
          "Không thể xóa bài trắc nghiệm vì đã có học sinh/sinh viên làm!"
        );
        return;
      }

      toast.success("Xóa bài bài trắc nghiệm thành công!");
      // Refresh quiz list
      dispatch(fetchQuizzesByInstructor(currentUser.userInstructor.id));
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài trắc nghiệm!");
    } finally {
      setDeleteDialog({ open: false, type: "", id: "" });
    }
  };

  // Update the edit button click handler in QuizList component
  const handleEditClick = (quiz: Quiz) => {
    onEditClick(quiz);
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tên bài trắc nghiệm</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Khóa học/Lớp học</TableCell>
            <TableCell align="center">Số bài làm</TableCell>
            <TableCell align="center">Số câu hỏi</TableCell>
            <TableCell align="center">Điểm đạt</TableCell>
            <TableCell align="center">Thời gian (phút)</TableCell>
            <TableCell align="center">Ngày tạo</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quizzes.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell>{quiz.title}</TableCell>
              <TableCell>
                {quiz.lessonId ? (
                  <Chip
                    icon={<MenuBook />}
                    label="Khóa học"
                    color="primary"
                    size="small"
                  />
                ) : (
                  <Chip
                    icon={<School />}
                    label="Lớp học"
                    color="info"
                    size="small"
                  />
                )}
              </TableCell>
              <TableCell>
                {quiz.lessonId
                  ? quiz.lesson?.section.course.title
                  : quiz.academicClass?.className +
                    " - " +
                    quiz.academicClass?.classCode}
              </TableCell>
              {/* Add attempt count cell */}
              <TableCell align="center">
                <Chip
                  label={getQuizAttemptCount(quiz.id)}
                  color={
                    getQuizAttemptCount(quiz.id) > 0 ? "primary" : "default"
                  }
                  size="small"
                  sx={{
                    minWidth: 60,
                    fontWeight: "medium",
                  }}
                />
              </TableCell>
              <TableCell align="center">{quiz.questions.length}</TableCell>
              <TableCell align="center">{quiz.passingScore}%</TableCell>
              <TableCell align="center">{quiz.timeLimit}</TableCell>
              <TableCell align="center">
                {formatDateTime(quiz.createdAt)}
              </TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Tooltip title="Xem chi tiết">
                    <IconButton size="small" onClick={() => onQuizClick(quiz)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(quiz);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(quiz);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {quizzes.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                Không có bài trắc nghiệm nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Add confirmation dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: "", id: "" })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa bài trắc nghiệm này?
            {"\n"}
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, type: "", id: "" })}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default InstructorQuizs;
