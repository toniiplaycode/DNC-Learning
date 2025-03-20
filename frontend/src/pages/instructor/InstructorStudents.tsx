import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tab,
  Tabs,
  LinearProgress,
  Menu,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  Search,
  Mail,
  Block,
  MoreVert,
  FilterList,
  Person,
  Email,
  Phone,
  School,
  Payment,
  CalendarToday,
  LocationOn,
  Grade,
  Assignment,
  SortByAlpha,
  AccessTime,
} from "@mui/icons-material";

// Add these interfaces near the top of the file
interface Assignment {
  id: number;
  name: string;
  score: number;
  maxScore: number;
  submittedDate: string;
}

interface Quiz {
  id: number;
  name: string;
  score: number;
  maxScore: number;
  submittedDate: string;
}

interface CourseGrade {
  courseId: number;
  courseName: string;
  assignments: Assignment[];
  quizzes: Quiz[];
  finalGrade: number;
}

// Cập nhật interface cho student
interface Student {
  id: number;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  address: string;
  enrolledCourses: number;
  totalSpent: number;
  lastActive: string;
  status: string;
  joinDate: string;
  courses: any[]; // Có thể tạo interface riêng nếu cần
  payments: any[]; // Có thể tạo interface riêng nếu cần
  grades?: CourseGrade[]; // Thêm dấu ? để đánh dấu optional
  type: string; // Added type field
  completedCourses: number;
  certificates: number;
  studentId?: string;
  faculty?: string;
  major?: string;
  academicYear?: string;
  year?: number;
}

// Mock data
const mockStudents = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "/src/assets/logo.png",
    email: "nguyenvana@gmail.com",
    phone: "0987654321",
    address: "Hà Nội, Việt Nam",
    enrolledCourses: 3,
    totalSpent: 1500000,
    lastActive: "2024-03-15",
    status: "active",
    joinDate: "2024-01-15",
    courses: [
      {
        id: 1,
        name: "React & TypeScript Masterclass",
        progress: 75,
        enrollDate: "2024-01-20",
        completedLessons: 36,
        totalLessons: 48,
      },
      {
        id: 2,
        name: "Node.js Advanced Concepts",
        progress: 30,
        enrollDate: "2024-02-15",
        completedLessons: 12,
        totalLessons: 40,
      },
    ],
    payments: [
      {
        id: 1,
        courseId: 1,
        courseName: "React & TypeScript Masterclass",
        amount: 899000,
        date: "2024-01-20",
      },
      {
        id: 2,
        courseId: 2,
        courseName: "Node.js Advanced Concepts",
        amount: 699000,
        date: "2024-02-15",
      },
    ],
    grades: [
      {
        courseId: 1,
        courseName: "React & TypeScript Masterclass",
        assignments: [
          {
            id: 1,
            name: "Assignment 1: React Hooks",
            score: 85,
            maxScore: 100,
            submittedDate: "2024-02-01",
          },
          {
            id: 2,
            name: "Assignment 2: TypeScript Basics",
            score: 90,
            maxScore: 100,
            submittedDate: "2024-02-15",
          },
          {
            id: 3,
            name: "Mid-term Project",
            score: 88,
            maxScore: 100,
            submittedDate: "2024-03-01",
          },
        ],
        quizzes: [
          {
            id: 1,
            name: "Quiz 1: React Fundamentals",
            score: 8,
            maxScore: 10,
            submittedDate: "2024-01-25",
          },
          {
            id: 2,
            name: "Quiz 2: TypeScript Types",
            score: 9,
            maxScore: 10,
            submittedDate: "2024-02-10",
          },
        ],
        finalGrade: 87.5,
      },
    ],
    type: "student",
    completedCourses: 1,
    certificates: 1,
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "/src/assets/logo.png",
    email: "tranthib@gmail.com",
    phone: "0987654322",
    address: "Hà Nội, Việt Nam",
    enrolledCourses: 2,
    totalSpent: 1000000,
    lastActive: "2024-03-14",
    status: "inactive",
    joinDate: "2024-01-14",
    courses: [],
    payments: [],
    type: "student",
    completedCourses: 0,
    certificates: 0,
  },
  {
    id: 3,
    name: "Phạm Văn C",
    email: "phamvanc@university.edu.vn",
    phone: "0903456789",
    avatar: "/src/assets/logo.png",
    enrolledCourses: 4,
    totalSpent: 1000000,
    lastActive: "5 giờ trước",
    status: "active",
    joinDate: "2024-01-15",
    courses: [
      {
        id: 1,
        name: "React & TypeScript Masterclass",
        progress: 75,
        enrollDate: "2024-01-20",
        completedLessons: 36,
        totalLessons: 48,
      },
      {
        id: 2,
        name: "Node.js Advanced Concepts",
        progress: 30,
        enrollDate: "2024-02-15",
        completedLessons: 12,
        totalLessons: 40,
      },
    ],
    payments: [
      {
        id: 1,
        courseId: 1,
        courseName: "React & TypeScript Masterclass",
        amount: 899000,
        date: "2024-01-20",
      },
      {
        id: 2,
        courseId: 2,
        courseName: "Node.js Advanced Concepts",
        amount: 699000,
        date: "2024-02-15",
      },
    ],
    grades: [
      {
        courseId: 1,
        courseName: "React & TypeScript Masterclass",
        assignments: [
          {
            id: 1,
            name: "Assignment 1: React Hooks",
            score: 85,
            maxScore: 100,
            submittedDate: "2024-02-01",
          },
          {
            id: 2,
            name: "Assignment 2: TypeScript Basics",
            score: 90,
            maxScore: 100,
            submittedDate: "2024-02-15",
          },
          {
            id: 3,
            name: "Mid-term Project",
            score: 88,
            maxScore: 100,
            submittedDate: "2024-03-01",
          },
        ],
        quizzes: [
          {
            id: 1,
            name: "Quiz 1: React Fundamentals",
            score: 8,
            maxScore: 10,
            submittedDate: "2024-01-25",
          },
          {
            id: 2,
            name: "Quiz 2: TypeScript Types",
            score: 9,
            maxScore: 10,
            submittedDate: "2024-02-10",
          },
        ],
        finalGrade: 87.5,
      },
    ],
    type: "student_academic",
    completedCourses: 2,
    certificates: 2,
    studentId: "SV001",
    faculty: "Công nghệ thông tin",
    major: "Khoa học máy tính",
    academicYear: "2021-2025",
    year: 3,
  },
  {
    id: 4,
    name: "Lê Thị D",
    email: "lethid@university.edu.vn",
    phone: "0904567890",
    avatar: "/src/assets/logo.png",
    enrolledCourses: 5,
    totalSpent: 1000000,
    lastActive: "12 giờ trước",
    status: "active",
    joinDate: "2024-01-15",
    courses: [
      {
        id: 1,
        name: "React & TypeScript Masterclass",
        progress: 75,
        enrollDate: "2024-01-20",
        completedLessons: 36,
        totalLessons: 48,
      },
      {
        id: 2,
        name: "Node.js Advanced Concepts",
        progress: 30,
        enrollDate: "2024-02-15",
        completedLessons: 12,
        totalLessons: 40,
      },
    ],
    payments: [
      {
        id: 1,
        courseId: 1,
        courseName: "React & TypeScript Masterclass",
        amount: 899000,
        date: "2024-01-20",
      },
      {
        id: 2,
        courseId: 2,
        courseName: "Node.js Advanced Concepts",
        amount: 699000,
        date: "2024-02-15",
      },
    ],
    grades: [
      {
        courseId: 1,
        courseName: "React & TypeScript Masterclass",
        assignments: [
          {
            id: 1,
            name: "Assignment 1: React Hooks",
            score: 85,
            maxScore: 100,
            submittedDate: "2024-02-01",
          },
          {
            id: 2,
            name: "Assignment 2: TypeScript Basics",
            score: 90,
            maxScore: 100,
            submittedDate: "2024-02-15",
          },
          {
            id: 3,
            name: "Mid-term Project",
            score: 88,
            maxScore: 100,
            submittedDate: "2024-03-01",
          },
        ],
        quizzes: [
          {
            id: 1,
            name: "Quiz 1: React Fundamentals",
            score: 8,
            maxScore: 10,
            submittedDate: "2024-01-25",
          },
          {
            id: 2,
            name: "Quiz 2: TypeScript Types",
            score: 9,
            maxScore: 10,
            submittedDate: "2024-02-10",
          },
        ],
        finalGrade: 87.5,
      },
    ],
    type: "student_academic",
    completedCourses: 4,
    certificates: 3,
    studentId: "SV002",
    faculty: "Công nghệ thông tin",
    major: "Kỹ thuật phần mềm",
    academicYear: "2020-2024",
    year: 4,
  },
];

// Mock data cho các khoa
const faculties = [
  "Tất cả",
  "Công nghệ thông tin",
  "Kỹ thuật điện tử",
  "Quản trị kinh doanh",
  "Ngoại ngữ",
];

// Mock data cho các ngành học
const majors = [
  "Tất cả",
  "Khoa học máy tính",
  "Kỹ thuật phần mềm",
  "Hệ thống thông tin",
  "An toàn thông tin",
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

const InstructorStudents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [studentType, setStudentType] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [filterFaculty, setFilterFaculty] = useState("Tất cả");
  const [filterMajor, setFilterMajor] = useState("Tất cả");

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "inactive":
        return "Không hoạt động";
      default:
        return status;
    }
  };

  const filteredStudents = mockStudents
    .filter((student) => {
      if (studentType === "all") return true;
      return student.type === studentType;
    })
    .filter((student) => {
      if (student.type === "student_academic") {
        if (filterFaculty !== "Tất cả" && student.faculty !== filterFaculty)
          return false;
        if (filterMajor !== "Tất cả" && student.major !== filterMajor)
          return false;
      }

      return (
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.type === "student_academic" &&
          student.studentId?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "lastActive") {
        return a.lastActive.localeCompare(b.lastActive);
      }
      if (sortBy === "progress") return b.progress - a.progress;
      return 0;
    });

  const handleOpenDialog = (student: any) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
    setTabValue(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSuspend = () => {
    setSuspendDialogOpen(true);
    setAnchorEl(null);
  };

  const handleConfirmSuspend = () => {
    // TODO: Implement suspend logic
    setSuspendDialogOpen(false);
    // Refresh data or update UI
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    student: any
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Quản lý học viên
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <TextField
              size="small"
              placeholder="Tìm kiếm học viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <Tabs
        value={studentType}
        onChange={(_, newValue) => setStudentType(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Tất cả học viên" value="all" />
        <Tab label="Học viên bên ngoài" value="student" />
        <Tab label="Sinh viên trường" value="student_academic" />
      </Tabs>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {(studentType === "all" || studentType === "student_academic") && (
          <>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Khoa</InputLabel>
                <Select
                  value={filterFaculty}
                  label="Khoa"
                  onChange={(e) => setFilterFaculty(e.target.value)}
                >
                  {faculties.map((faculty) => (
                    <MenuItem key={faculty} value={faculty}>
                      {faculty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Ngành học</InputLabel>
                <Select
                  value={filterMajor}
                  label="Ngành học"
                  onChange={(e) => setFilterMajor(e.target.value)}
                >
                  {majors.map((major) => (
                    <MenuItem key={major} value={major}>
                      {major}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Sắp xếp theo:</Typography>
            <Button
              variant={sortBy === "name" ? "contained" : "outlined"}
              size="small"
              startIcon={<SortByAlpha />}
              onClick={() => setSortBy("name")}
            >
              Tên
            </Button>
            <Button
              variant={sortBy === "lastActive" ? "contained" : "outlined"}
              size="small"
              startIcon={<AccessTime />}
              onClick={() => setSortBy("lastActive")}
            >
              Hoạt động gần đây
            </Button>
            <Button
              variant={sortBy === "progress" ? "contained" : "outlined"}
              size="small"
              startIcon={<Assignment />}
              onClick={() => setSortBy("progress")}
            >
              Tiến độ
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Học viên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Khóa học</TableCell>
                <TableCell align="right">Tổng chi tiêu</TableCell>
                <TableCell>Hoạt động cuối</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents
                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                .map((student) => (
                  <TableRow
                    key={student.id}
                    hover
                    onClick={() => handleOpenDialog(student)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={student.avatar} />
                        <Typography variant="body2">{student.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell align="center">
                      {student.enrolledCourses}
                    </TableCell>
                    <TableCell align="right">
                      {student.totalSpent.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell>
                      {new Date(student.lastActive).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getStatusColor(student.status)}
                        label={getStatusLabel(student.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <Mail />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Block />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={Math.ceil(filteredStudents.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                src={selectedStudent?.avatar}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="h6">{selectedStudent?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tham gia từ:{" "}
                  {selectedStudent &&
                    new Date(selectedStudent.joinDate).toLocaleDateString(
                      "vi-VN"
                    )}
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="Đình chỉ học">
              <Button
                variant="outlined"
                color="error"
                startIcon={<Block />}
                onClick={handleSuspend}
              >
                Đình chỉ
              </Button>
            </Tooltip>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Thông tin cá nhân" />
            <Tab label="Khóa học" />
            <Tab label="Điểm số" />
            <Tab label="Lịch sử thanh toán" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={selectedStudent?.email}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone />
                </ListItemIcon>
                <ListItemText
                  primary="Số điện thoại"
                  secondary={selectedStudent?.phone}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText
                  primary="Địa chỉ"
                  secondary={selectedStudent?.address}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <School />
                </ListItemIcon>
                <ListItemText
                  primary="Số khóa học đã đăng ký"
                  secondary={selectedStudent?.enrolledCourses}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Payment />
                </ListItemIcon>
                <ListItemText
                  primary="Tổng chi tiêu"
                  secondary={`${selectedStudent?.totalSpent.toLocaleString(
                    "vi-VN"
                  )}đ`}
                />
              </ListItem>
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {selectedStudent?.courses.map((course: any) => (
              <Card key={course.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {course.name}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày đăng ký:{" "}
                      {new Date(course.enrollDate).toLocaleDateString("vi-VN")}
                    </Typography>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Tiến độ học tập: {course.progress}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      Hoàn thành {course.completedLessons}/{course.totalLessons}{" "}
                      bài học
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {selectedStudent?.grades?.length ? (
              selectedStudent.grades.map((courseGrade: CourseGrade) => (
                <Card key={courseGrade.courseId} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {courseGrade.courseName}
                    </Typography>

                    <Box
                      sx={{
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Grade color="primary" />
                      <Typography variant="subtitle1">
                        Điểm tổng kết: {courseGrade.finalGrade}/100
                      </Typography>
                    </Box>

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      <Assignment sx={{ mr: 1, verticalAlign: "bottom" }} />
                      Bài tập
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tên bài tập</TableCell>
                            <TableCell align="center">Điểm</TableCell>
                            <TableCell align="right">Ngày nộp</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {courseGrade.assignments.map(
                            (assignment: Assignment) => (
                              <TableRow key={assignment.id}>
                                <TableCell>{assignment.name}</TableCell>
                                <TableCell align="center">
                                  {assignment.score}/{assignment.maxScore}
                                </TableCell>
                                <TableCell align="right">
                                  {new Date(
                                    assignment.submittedDate
                                  ).toLocaleDateString("vi-VN")}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                      <Grade sx={{ mr: 1, verticalAlign: "bottom" }} />
                      Quiz
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tên quiz</TableCell>
                            <TableCell align="center">Điểm</TableCell>
                            <TableCell align="right">Ngày làm</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {courseGrade.quizzes.map((quiz: Quiz) => (
                            <TableRow key={quiz.id}>
                              <TableCell>{quiz.name}</TableCell>
                              <TableCell align="center">
                                {quiz.score}/{quiz.maxScore}
                              </TableCell>
                              <TableCell align="right">
                                {new Date(
                                  quiz.submittedDate
                                ).toLocaleDateString("vi-VN")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(courseGrade.finalGrade / 100) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          bgcolor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            bgcolor:
                              courseGrade.finalGrade >= 80
                                ? "success.main"
                                : courseGrade.finalGrade >= 60
                                ? "warning.main"
                                : "error.main",
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                Chưa có thông tin điểm
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Khóa học</TableCell>
                    <TableCell align="right">Số tiền</TableCell>
                    <TableCell>Ngày thanh toán</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedStudent?.payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.courseName}</TableCell>
                      <TableCell align="right">
                        {payment.amount.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell>
                        {new Date(payment.date).toLocaleDateString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={suspendDialogOpen}
        onClose={() => setSuspendDialogOpen(false)}
      >
        <DialogTitle>Xác nhận đình chỉ học</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn đình chỉ học viên {selectedStudent?.name}? Học
            viên sẽ không thể truy cập vào các khóa học đã đăng ký.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialogOpen(false)}>Hủy</Button>
          <Button color="error" onClick={handleConfirmSuspend}>
            Xác nhận đình chỉ
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenDialog}>
          <Person sx={{ mr: 1 }} fontSize="small" />
          Xem thông tin chi tiết
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Mail sx={{ mr: 1 }} fontSize="small" />
          Gửi tin nhắn
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Assignment sx={{ mr: 1 }} fontSize="small" />
          Xem bài tập
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Grade sx={{ mr: 1 }} fontSize="small" />
          Xem điểm số
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InstructorStudents;
