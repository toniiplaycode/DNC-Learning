import { useEffect, useState } from "react";
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
  MenuBook,
  Close,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchStudentsByInstructor } from "../../features/users/usersApiSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { selectInstructorStudents } from "../../features/users/usersSelectors";

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
  className?: string;
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

// Tab Panel component
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ padding: "16px 0" }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const InstructorStudents = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const instructorStudents = useAppSelector(selectInstructorStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [studentType, setStudentType] = useState<
    "student" | "student_academic"
  >("student");
  const [sortBy, setSortBy] = useState("name");
  const [filterFaculty, setFilterFaculty] = useState("Tất cả");
  const [filterMajor, setFilterMajor] = useState("Tất cả");
  const [classFilter, setClassFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchStudentsByInstructor(currentUser?.userInstructor?.id));
  }, [dispatch, currentUser]);

  console.log(instructorStudents);

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

  const handleStudentTypeChange = (event: any) => {
    setStudentType(event.target.value as "student" | "student_academic");
    setPage(1);
  };

  const paginatedStudents = filteredStudents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Thêm hàm xử lý sự kiện click vào sinh viên
  const handleRowClick = (student: any) => {
    setSelectedStudent(student);
    setDialogOpen(true);
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
            flexWrap="wrap"
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
                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Loại học viên</InputLabel>
              <Select
                value={studentType}
                label="Loại học viên"
                onChange={handleStudentTypeChange}
              >
                <MenuItem value="student">Học viên</MenuItem>
                <MenuItem value="student_academic">Sinh viên trường</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp theo"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Tên</MenuItem>
                <MenuItem value="joinDate">Ngày tham gia</MenuItem>
                <MenuItem value="enrolledCourses">Số khóa học</MenuItem>
              </Select>
            </FormControl>

            {studentType === "student_academic" && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Lớp</InputLabel>
                <Select
                  value={classFilter}
                  label="Lớp"
                  onChange={(e) => setClassFilter(e.target.value as string)}
                >
                  <MenuItem value="all">Tất cả lớp</MenuItem>
                </Select>
              </FormControl>
            )}

            {studentType === "student_academic" && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Khoa</InputLabel>
                <Select
                  value={facultyFilter}
                  label="Khoa"
                  onChange={(e) => setFacultyFilter(e.target.value as string)}
                >
                  <MenuItem value="all">Tất cả khoa</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  {studentType === "student_academic" && (
                    <>
                      <TableCell>Mã SV</TableCell>
                      <TableCell>Lớp</TableCell>
                      <TableCell>Khoa</TableCell>
                    </>
                  )}
                  <TableCell>Email</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      onClick={() => handleRowClick(student)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={student.avatar}>
                            {student.name ? student.name.charAt(0) : ""}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">
                              {student.name}
                            </Typography>
                            {student.type === "student_academic" && (
                              <Chip
                                icon={<School fontSize="small" />}
                                label="SV"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mr: 1 }}
                              />
                            )}
                            {student.type === "student" && (
                              <Chip
                                icon={<MenuBook fontSize="small" />}
                                label="HV"
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ mr: 1 }}
                              />
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      {student.type === "student_academic" && (
                        <>
                          <TableCell>{student.studentId || "-"}</TableCell>
                          <TableCell>{student.className || "-"}</TableCell>
                          <TableCell>{student.faculty || "-"}</TableCell>
                        </>
                      )}
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.enrolledCourses}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>{student.joinDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            student.status === "active"
                              ? "Đang hoạt động"
                              : "Không hoạt động"
                          }
                          color={
                            student.status === "active" ? "success" : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, student)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={studentType === "student_academic" ? 9 : 8}
                      align="center"
                    >
                      Không tìm thấy học viên nào
                    </TableCell>
                  </TableRow>
                )}
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
        </CardContent>
      </Card>

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
          Xem thông tin
        </MenuItem>
      </Menu>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Chi tiết học viên</Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedStudent && (
            <Box>
              <Stack
                direction="row"
                spacing={3}
                alignItems="flex-start"
                sx={{ mb: 3 }}
              >
                <Avatar
                  src={selectedStudent.avatar}
                  sx={{ width: 56, height: 56 }}
                >
                  {selectedStudent.name ? selectedStudent.name.charAt(0) : ""}
                </Avatar>
                <Box>
                  <Typography variant="h5">{selectedStudent.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudent.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudent.phone || "Chưa cập nhật số điện thoại"}
                  </Typography>
                </Box>
              </Stack>

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Thông tin cá nhân" />
                <Tab label="Khóa học" />
                <Tab label="Điểm số" />
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
                      secondary={selectedStudent?.phone || "-"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Địa chỉ"
                      secondary={selectedStudent?.address || "-"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <School />
                    </ListItemIcon>
                    <ListItemText
                      primary="Số khóa học đã đăng ký"
                      secondary={selectedStudent?.enrolledCourses || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Hoạt động gần đây"
                      secondary={
                        selectedStudent?.lastActive
                          ? new Date(
                              selectedStudent.lastActive
                            ).toLocaleDateString("vi-VN")
                          : "-"
                      }
                    />
                  </ListItem>
                  {selectedStudent?.type === "student_academic" && (
                    <>
                      <ListItem>
                        <ListItemIcon>
                          <School />
                        </ListItemIcon>
                        <ListItemText
                          primary="Mã sinh viên"
                          secondary={selectedStudent?.studentId || "-"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <School />
                        </ListItemIcon>
                        <ListItemText
                          primary="Lớp"
                          secondary={selectedStudent?.className || "-"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <School />
                        </ListItemIcon>
                        <ListItemText
                          primary="Khoa"
                          secondary={selectedStudent?.faculty || "-"}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {selectedStudent?.courses?.length > 0 ? (
                  selectedStudent.courses.map((course: any) => (
                    <Card key={course.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="flex-start"
                        >
                          <Avatar src={course.image}>
                            {course.name || course.title
                              ? (course.name || course.title).charAt(0)
                              : ""}
                          </Avatar>
                          <Stack spacing={1} sx={{ flex: 1 }}>
                            <Typography variant="h6">
                              {course.name || course.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ngày đăng ký:{" "}
                              {new Date(course.enrollDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Typography>
                            <Box>
                              <LinearProgress
                                variant="determinate"
                                value={course.progress}
                                sx={{ height: 6, borderRadius: 1 }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mt: 0.5, display: "block" }}
                              >
                                {course.progress}% hoàn thành
                              </Typography>
                            </Box>
                            <Typography variant="body2">
                              Hoàn thành {course.completedLessons}/
                              {course.totalLessons} bài học
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 3 }}
                  >
                    Chưa có khóa học nào
                  </Typography>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {selectedStudent?.grades?.length > 0 ? (
                  selectedStudent.grades.map((courseGrade: CourseGrade) => (
                    <Card key={courseGrade.courseId} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {courseGrade.courseName}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Điểm tổng: {courseGrade.finalGrade}/100
                        </Typography>

                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
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

                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                          Bài kiểm tra
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Tên bài kiểm tra</TableCell>
                                <TableCell align="center">Điểm</TableCell>
                                <TableCell align="right">Ngày làm</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {courseGrade.quizzes?.map((quiz: Quiz) => (
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
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 3 }}
                  >
                    Chưa có thông tin điểm
                  </Typography>
                )}
              </TabPanel>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InstructorStudents;
