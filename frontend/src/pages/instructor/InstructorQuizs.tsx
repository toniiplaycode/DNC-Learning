import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import DialogAddEditQuiz from "../../components/instructor/course/DialogAddEditQuiz";
import {
  fetchAttemptsByQuizId,
  fetchInstructorAttempts,
  fetchQuizzesByInstructor,
} from "../../features/quizzes/quizzesSlice";
import {
  selectInstructorAttempts,
  selectInstructorQuizzes,
  selectQuizAttempts,
} from "../../features/quizzes/quizzesSelectors";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { formatDateTime } from "../../utils/formatters";

// Mock data
const mockQuizzes = [
  {
    id: 1,
    title: "Kiểm tra React cơ bản",
    course: "React & TypeScript Masterclass",
    courseId: 1,
    totalQuestions: 15,
    totalPoints: 100,
    passingScore: 70,
    dateCreated: "2024-03-15",
    attempts: 45,
    averageScore: 78.5,
    submissions: [
      {
        id: 101,
        studentId: 1,
        studentName: "Nguyễn Văn A",
        avatar: "/src/assets/avatar.png",
        status: "passed",
        score: 85,
        submittedDate: "2024-03-16T10:30:00",
        timeSpent: 25,
        studentType: "student",
        answers: [
          { question: 1, answer: 2, correct: true },
          { question: 2, answer: 3, correct: true },
          { question: 3, answer: 0, correct: false },
          // thêm các câu trả lời khác
        ],
      },
      {
        id: 102,
        studentId: 5,
        studentName: "Trần Thị B",
        studentCode: "SV001",
        className: "CNTT-K44A",
        faculty: "Công nghệ thông tin",
        avatar: "/src/assets/avatar.png",
        status: "failed",
        score: 60,
        submittedDate: "2024-03-16T11:15:00",
        timeSpent: 28,
        studentType: "student_academic",
        answers: [
          { question: 1, answer: 2, correct: true },
          { question: 2, answer: 1, correct: true },
          { question: 3, answer: 2, correct: true },
          // ...more answers
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Đánh giá kiến thức TypeScript",
    course: "React & TypeScript Masterclass",
    courseId: 1,
    totalQuestions: 20,
    totalPoints: 100,
    passingScore: 75,
    dateCreated: "2024-03-18",
    attempts: 38,
    averageScore: 82.3,
    submissions: [
      {
        id: 201,
        studentId: 2,
        studentName: "Lê Thị C",
        avatar: "/src/assets/avatar.png",
        status: "passed",
        score: 90,
        submittedDate: "2024-03-19T14:20:00",
        timeSpent: 22,
        studentType: "student",
        answers: [
          { question: 1, answer: 2, correct: true },
          { question: 2, answer: 1, correct: true },
          { question: 3, answer: 2, correct: true },
          // ...more answers
        ],
      },
      {
        id: 202,
        studentId: 6,
        studentName: "Phạm Văn D",
        studentCode: "SV002",
        className: "CNTT-K44B",
        faculty: "Công nghệ thông tin",
        avatar: "/src/assets/avatar.png",
        status: "passed",
        score: 85,
        submittedDate: "2024-03-19T15:30:00",
        timeSpent: 26,
        studentType: "student_academic",
        answers: [
          { question: 1, answer: 2, correct: true },
          { question: 2, answer: 1, correct: true },
          { question: 3, answer: 2, correct: true },
          // ...more answers
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Kiểm tra Node.js cơ bản",
    course: "Node.js Advanced Concepts",
    courseId: 2,
    totalQuestions: 25,
    totalPoints: 100,
    passingScore: 70,
    dateCreated: "2024-03-10",
    attempts: 22,
    averageScore: 75.8,
    submissions: [
      {
        id: 301,
        studentId: 3,
        studentName: "Nguyễn Thị E",
        avatar: "/src/assets/avatar.png",
        status: "failed",
        score: 65,
        submittedDate: "2024-03-12T09:15:00",
        timeSpent: 30,
        studentType: "student",
        answers: [
          { question: 1, answer: 1, correct: false },
          { question: 2, answer: 1, correct: true },
          { question: 3, answer: 1, correct: false },
          // ...more answers
        ],
      },
      {
        id: 302,
        studentId: 7,
        studentName: "Hoàng Văn F",
        studentCode: "SV003",
        className: "KHMT-K44A",
        faculty: "Khoa học máy tính",
        avatar: "/src/assets/avatar.png",
        status: "passed",
        score: 78,
        submittedDate: "2024-03-12T10:25:00",
        timeSpent: 28,
        studentType: "student_academic",
        answers: [
          { question: 1, answer: 2, correct: true },
          { question: 2, answer: 1, correct: true },
          { question: 3, answer: 2, correct: true },
          // ...more answers
        ],
      },
    ],
  },
];

// Danh sách lớp học
const mockClasses = [
  "Tất cả",
  "CNTT-K44A",
  "CNTT-K44B",
  "CNTT-K45A",
  "KHMT-K44A",
  "KTPM-K44A",
];

// Danh sách khoa
const mockFaculties = [
  "Tất cả",
  "Công nghệ thông tin",
  "Khoa học máy tính",
  "Kỹ thuật phần mềm",
];

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

// Add TabPanel component
const StudentTypeTabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  type,
}) => {
  return (
    <div role="tabpanel" hidden={value !== type}>
      {value === type && children}
    </div>
  );
};

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
  const [classFilter, setClassFilter] = useState("Tất cả");
  const [facultyFilter, setFacultyFilter] = useState("Tất cả");
  const [tabValue, setTabValue] = useState(0);
  const [openAttemptDetails, setOpenAttemptDetails] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(
    null
  );
  const [openAddQuizModal, setOpenAddQuizModal] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  const [mockCourseData, setMockCourseData] = useState({
    sections: [
      { id: 1, title: "Section 1", contents: [] },
      { id: 2, title: "Section 2", contents: [] },
      { id: 3, title: "Section 3", contents: [] },
    ],
  });

  useEffect(() => {
    // Fetch both quizzes and attempts
    dispatch(fetchQuizzesByInstructor(currentUser.userInstructor.id));
    dispatch(fetchInstructorAttempts(currentUser.userInstructor.id));
  }, [dispatch, currentUser]);

  // Danh sách khóa học từ mock data
  const courses = [...new Set(mockQuizzes.map((quiz) => quiz.course))];

  // Xử lý click vào quiz
  const handleQuizClick = (quiz: Quiz) => {
    console.log("Quiz clicked:", quiz);
    dispatch(fetchAttemptsByQuizId(quiz.id));
    setSelectedQuiz(quiz);
  };

  console.log(quizAttempts);

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

    return quizAttempts.filter((attempt) => {
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

  // Tổng hợp tất cả các bài nộp từ các Bài trắc nghiệm
  const getAllSubmissions = () => {
    const allSubmissions: any[] = [];

    mockQuizzes.forEach((quiz) => {
      if (filterCourse === "all" || filterCourse === quiz.courseId.toString()) {
        quiz.submissions.forEach((submission) => {
          allSubmissions.push({
            ...submission,
            quizId: quiz.id,
            quizTitle: quiz.title,
            courseName: quiz.course,
          });
        });
      }
    });

    return allSubmissions;
  };

  // Lọc các bài nộp theo bộ lọc
  const filteredSubmissions = getAllSubmissions().filter((submission) => {
    // Lọc theo từ khóa tìm kiếm
    if (
      searchQuery &&
      !submission.studentName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !submission.quizTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Lọc theo trạng thái
    if (filterStatus !== "all" && submission.status !== filterStatus) {
      return false;
    }

    // Lọc theo loại học viên
    if (
      studentTypeFilter !== "all" &&
      submission.studentType !== studentTypeFilter
    ) {
      return false;
    }

    // Lọc theo lớp (chỉ áp dụng cho sinh viên trường)
    if (
      submission.studentType === "student_academic" &&
      classFilter !== "Tất cả" &&
      submission.className !== classFilter
    ) {
      return false;
    }

    // Lọc theo khoa (chỉ áp dụng cho sinh viên trường)
    if (
      submission.studentType === "student_academic" &&
      facultyFilter !== "Tất cả" &&
      submission.faculty !== facultyFilter
    ) {
      return false;
    }

    return true;
  });

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
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Khóa học</InputLabel>
                <Select
                  value={filterCourse}
                  label="Khóa học"
                  onChange={(e) => setFilterCourse(e.target.value)}
                >
                  <MenuItem value="all">Tất cả khóa học</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course} value={course}>
                      {course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  label="Tất cả học viên"
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

            {/* Move class and faculty filters to student_academic tab panel */}
            <StudentTypeTabPanel
              value={studentTypeFilter}
              type="student_academic"
            >
              <Stack
                direction="row"
                sx={{ display: "flex", gap: 2, marginBottom: 2 }}
              >
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Lớp</InputLabel>
                  <Select
                    value={classFilter}
                    label="Lớp"
                    onChange={(e) => setClassFilter(e.target.value as string)}
                  >
                    {mockClasses.map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        {cls}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Khoa</InputLabel>
                  <Select
                    value={facultyFilter}
                    label="Khoa"
                    onChange={(e) => setFacultyFilter(e.target.value as string)}
                  >
                    {mockFaculties.map((faculty) => (
                      <MenuItem key={faculty} value={faculty}>
                        {faculty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenAddQuizModal(true)}
                  startIcon={<Add />}
                >
                  Tạo Bài trắc nghiệm mới
                </Button>
              </Stack>
            </StudentTypeTabPanel>

            {/* Update QuizList usage */}
            <QuizList
              quizzes={getFilteredQuizzes()}
              onQuizClick={handleQuizClick}
            />
          </CardContent>
        </Card>
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
                            </Stack>
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

                <Typography variant="h6" gutterBottom>
                  Chi tiết câu trả lời
                </Typography>

                <List>
                  {selectedAttempt.responses.map((response) => (
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
                                      option.id === response.selectedOption?.id
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
                  ))}
                </List>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenAttemptDetails(false)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal Thêm quiz */}
      <DialogAddEditQuiz
        open={openAddQuizModal}
        onClose={() => {
          console.log("Closing quiz modal");
          setOpenAddQuizModal(false);
        }}
        // onSubmit={handleAddQuiz}
        initialSectionId={currentSectionId || undefined}
        sections={mockCourseData.sections}
        editMode={false}
        additionalInfo={{
          targetType: "academic",
          className: classFilter !== "all" ? classFilter : "Tất cả các lớp",
          faculty: facultyFilter !== "all" ? facultyFilter : "Tất cả các khoa",
        }}
      />

      {/* Modal sửa quiz */}
      {/* <DialogAddEditQuiz
        open={openEditQuizModal}
        onClose={() => setOpenEditQuizModal(false)}
        onSubmit={handleUpdateQuiz}
        quizToEdit={quizToEdit || undefined}
        sections={mockCourseData.sections}
        editMode={true}
        additionalInfo={{
          targetType: "academic",
          className: classFilter !== "all" ? classFilter : "Tất cả các lớp",
          faculty: facultyFilter !== "all" ? facultyFilter : "Tất cả các khoa",
        }}
      /> */}
    </Box>
  );
};

interface QuizListProps {
  quizzes: Quiz[];
  onQuizClick: (quiz: Quiz) => void;
}

const QuizList = ({ quizzes, onQuizClick }: QuizListProps) => {
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
                    <IconButton size="small">
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton size="small" color="error">
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
    </TableContainer>
  );
};

export default InstructorQuizs;
