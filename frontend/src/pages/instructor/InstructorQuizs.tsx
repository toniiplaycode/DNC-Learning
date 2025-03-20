import React, { useState } from "react";
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
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

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

const mockStudentAttempts = [
  {
    id: 1,
    studentId: 1,
    studentName: "Nguyễn Văn A",
    avatar: "/src/assets/avatar.png",
    score: 85,
    timeTaken: 18, // in minutes
    submittedDate: "2024-03-18 14:25",
    status: "passed",
    studentType: "student",
    answers: [
      { question: 1, answer: 2, correct: true },
      { question: 2, answer: 1, correct: true },
      { question: 3, answer: 0, correct: false },
      // ...more answers
    ],
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Trần Thị B",
    studentCode: "SV001",
    className: "CNTT-K44A",
    faculty: "Công nghệ thông tin",
    avatar: "/src/assets/avatar.png",
    score: 72,
    timeTaken: 25,
    submittedDate: "2024-03-18 15:10",
    status: "passed",
    studentType: "student_academic",
    answers: [
      { question: 1, answer: 2, correct: true },
      { question: 2, answer: 1, correct: true },
      { question: 3, answer: 2, correct: true },
      // ...more answers
    ],
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Lê Văn C",
    avatar: "/src/assets/avatar.png",
    score: 65,
    timeTaken: 25,
    submittedDate: "2024-03-18 16:10",
    status: "failed",
    studentType: "student",
    answers: [
      { question: 1, answer: 1, correct: false },
      { question: 2, answer: 1, correct: true },
      { question: 3, answer: 1, correct: false },
      // ...more answers
    ],
  },
  {
    id: 4,
    studentId: 4,
    studentName: "Phạm Thị D",
    avatar: "/src/assets/avatar.png",
    score: 78,
    timeTaken: 22,
    submittedDate: "2024-03-19 09:45",
    status: "passed",
    studentType: "student",
    answers: [
      { question: 1, answer: 2, correct: true },
      { question: 2, answer: 0, correct: false },
      { question: 3, answer: 2, correct: true },
      // ...more answers
    ],
  },
  {
    id: 5,
    studentId: 5,
    studentName: "Hoàng Văn E",
    avatar: "/src/assets/avatar.png",
    score: 88,
    timeTaken: 17,
    submittedDate: "2024-03-19 10:30",
    status: "passed",
    studentType: "student",
    answers: [
      { question: 1, answer: 2, correct: true },
      { question: 2, answer: 1, correct: true },
      { question: 3, answer: 2, correct: true },
      // ...more answers
    ],
  },
];

// Mock questions for the specific quiz
const mockQuestions = [
  {
    id: 1,
    question: "useState hook được sử dụng để làm gì?",
    options: [
      "Quản lý side effects",
      "Quản lý state trong functional component",
      "Tối ưu performance",
      "Xử lý routing",
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "useEffect hook được gọi khi nào?",
    options: [
      "Chỉ khi component mount",
      "Sau mỗi lần render",
      "Khi dependencies thay đổi",
      "Tất cả các trường hợp trên",
    ],
    correctAnswer: 3,
  },
  {
    id: 3,
    question: "useMemo hook dùng để làm gì?",
    options: [
      "Tối ưu performance bằng cách cache giá trị",
      "Quản lý state",
      "Xử lý side effects",
      "Tạo ref",
    ],
    correctAnswer: 0,
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

const InstructorQuizs = () => {
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Danh sách khóa học từ mock data
  const courses = [...new Set(mockQuizzes.map((quiz) => quiz.course))];

  // Xử lý click vào quiz
  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
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
    return mockStudentAttempts.filter((attempt) => {
      const matchesSearch = attempt.studentName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || attempt.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  // Component hiển thị các thống kê
  const QuizStatistics = ({ quiz }) => {
    const passedStudents = mockStudentAttempts.filter(
      (attempt) => attempt.status === "passed"
    ).length;
    const failedStudents = mockStudentAttempts.filter(
      (attempt) => attempt.status === "failed"
    ).length;
    const passRate = (passedStudents / mockStudentAttempts.length) * 100;

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Điểm trung bình
              </Typography>
              <Typography variant="h4" color="primary">
                {quiz.averageScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trên thang điểm 100
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tỷ lệ đạt
              </Typography>
              <Typography variant="h4" color="success.main">
                {passRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {passedStudents}/{mockStudentAttempts.length} học viên
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Số lượt làm bài
              </Typography>
              <Typography variant="h4">{quiz.attempts}</Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số lượt làm
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thời gian trung bình
              </Typography>
              <Typography variant="h4">
                {(
                  mockStudentAttempts.reduce(
                    (acc, cur) => acc + cur.timeTaken,
                    0
                  ) / mockStudentAttempts.length
                ).toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phút
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Tổng hợp tất cả các bài nộp từ các bài kiểm tra
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

  // Render danh sách quiz
  if (!selectedQuiz) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Bài kiểm tra
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <TextField
                placeholder="Tìm kiếm bài kiểm tra..."
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
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Loại học viên</InputLabel>
                <Select
                  value={studentTypeFilter}
                  label="Loại học viên"
                  onChange={(e) =>
                    setStudentTypeFilter(e.target.value as string)
                  }
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="student">Học viên bên ngoài</MenuItem>
                  <MenuItem value="student_academic">Sinh viên trường</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Bộ lọc thêm cho sinh viên trường */}
            {studentTypeFilter === "student_academic" && (
              <>
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
              </>
            )}

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên bài kiểm tra</TableCell>
                    <TableCell>Khóa học</TableCell>
                    <TableCell align="center">Số câu hỏi</TableCell>
                    <TableCell align="center">Điểm đạt</TableCell>
                    <TableCell align="center">Lượt làm</TableCell>
                    <TableCell align="center">Điểm TB</TableCell>
                    <TableCell align="center">Ngày tạo</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockQuizzes
                    .filter(
                      (quiz) =>
                        (filterCourse === "all" ||
                          quiz.course === filterCourse) &&
                        quiz.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                    .map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{quiz.course}</TableCell>
                        <TableCell align="center">
                          {quiz.totalQuestions}
                        </TableCell>
                        <TableCell align="center">
                          {quiz.passingScore}%
                        </TableCell>
                        <TableCell align="center">{quiz.attempts}</TableCell>
                        <TableCell align="center">
                          {quiz.averageScore.toFixed(1)}
                        </TableCell>
                        <TableCell align="center">
                          {new Date(quiz.dateCreated).toLocaleDateString(
                            "vi-VN"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleQuizClick(quiz)}
                          >
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Render chi tiết bài kiểm tra và danh sách học viên làm bài
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
                Khóa học: {selectedQuiz.course}
              </Typography>
              <Typography variant="body2">
                Số câu hỏi: {selectedQuiz.totalQuestions}
              </Typography>
              <Typography variant="body2">
                Điểm đạt: {selectedQuiz.passingScore}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" align="right">
                Ngày tạo:{" "}
                {new Date(selectedQuiz.dateCreated).toLocaleDateString("vi-VN")}
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
                      <TableCell>Bài kiểm tra</TableCell>
                      <TableCell>Khóa học</TableCell>
                      <TableCell>Thời gian làm</TableCell>
                      <TableCell>Thời gian nộp</TableCell>
                      <TableCell>Kết quả</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Avatar
                                src={submission.avatar}
                                sx={{ width: 30, height: 30 }}
                              />
                              <Typography variant="body2">
                                {submission.studentName}
                                {submission.studentType ===
                                  "student_academic" && (
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
                                {submission.studentCode || "-"}
                              </TableCell>
                              <TableCell>
                                {submission.className || "-"}
                              </TableCell>
                            </>
                          )}
                          <TableCell>{submission.quizTitle}</TableCell>
                          <TableCell>{submission.courseName}</TableCell>
                          <TableCell>{submission.timeSpent} phút</TableCell>
                          <TableCell>{submission.submittedDate}</TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color={
                                submission.status === "passed"
                                  ? "success.main"
                                  : "error.main"
                              }
                              fontWeight="bold"
                            >
                              {submission.score}/100
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewAttempt(submission)}
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
                          align="center"
                        >
                          Không tìm thấy dữ liệu
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
              {mockQuestions.map((question, index) => (
                <React.Fragment key={question.id}>
                  {index > 0 && <Divider />}
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          Câu {index + 1}: {question.question}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {question.options.map((option, i) => (
                            <Box
                              key={i}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 0.5,
                                p: 1,
                                borderRadius: 1,
                                bgcolor:
                                  i === question.correctAnswer
                                    ? "success.light"
                                    : "background.paper",
                              }}
                            >
                              {i === question.correctAnswer ? (
                                <CheckCircle
                                  color="success"
                                  fontSize="small"
                                  sx={{ mr: 1 }}
                                />
                              ) : (
                                <div style={{ width: 26, marginRight: 8 }} />
                              )}
                              <Typography
                                variant="body2"
                                fontWeight={
                                  i === question.correctAnswer
                                    ? "bold"
                                    : "normal"
                                }
                              >
                                {option}
                              </Typography>
                            </Box>
                          ))}
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
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={selectedAttempt.avatar}
                  sx={{ mr: 2, width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="h6">
                    {selectedAttempt.studentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nộp lúc: {selectedAttempt.submittedDate}
                  </Typography>
                </Box>
              </Box>
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
                          selectedAttempt.score >= selectedQuiz.passingScore
                            ? "success.main"
                            : "error.main"
                        }
                        fontWeight="bold"
                      >
                        {selectedAttempt.score}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        /100
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
                          selectedAttempt.status === "passed"
                            ? "Đạt"
                            : "Không đạt"
                        }
                        color={
                          selectedAttempt.status === "passed"
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
                        {selectedAttempt.timeTaken}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        phút
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Chi tiết câu trả lời
                </Typography>

                <List>
                  {mockQuestions.map((question, index) => {
                    const answer = selectedAttempt?.answers?.find(
                      (a) => a.question === question.id
                    );
                    const isCorrect = answer?.correct || false;

                    return (
                      <React.Fragment key={question.id}>
                        {index > 0 && <Divider />}
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
                                {isCorrect ? (
                                  <CheckCircle color="success" />
                                ) : (
                                  <Cancel color="error" />
                                )}
                                <Typography variant="subtitle1">
                                  Câu {index + 1}: {question.question}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                {question.options.map((option, i) => (
                                  <Box
                                    key={i}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      mb: 0.5,
                                      p: 1,
                                      borderRadius: 1,
                                      bgcolor:
                                        i === answer?.answer
                                          ? isCorrect
                                            ? "success.light"
                                            : "error.light"
                                          : i === question.correctAnswer
                                          ? "success.light"
                                          : "background.paper",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={
                                        i === answer?.answer ||
                                        i === question.correctAnswer
                                          ? "bold"
                                          : "normal"
                                      }
                                    >
                                      {option}
                                      {i === question.correctAnswer &&
                                        " (Đáp án đúng)"}
                                      {i === answer?.answer &&
                                        i !== question.correctAnswer &&
                                        " (Đã chọn)"}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAttemptDetails(false)}>Đóng</Button>
              <Button variant="contained" startIcon={<Email />}>
                Liên hệ học viên
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default InstructorQuizs;
