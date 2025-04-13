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
  LocationCity,
  Work,
  BubbleChart,
  CheckCircle,
  Badge,
  AccountBalance,
  Class,
  Info,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchStudentsByInstructor } from "../../features/users/usersApiSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { selectInstructorStudents } from "../../features/users/usersSelectors";
import React from "react";
import { fetchCoursesByInstructor } from "../../features/courses/coursesApiSlice";
import { selectCoursesByInstructor } from "../../features/courses/coursesSelector";

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
  const instructorCourses = useAppSelector(selectCoursesByInstructor);
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
  const [filterClassId, setFilterClassId] = useState<string>("Tất cả");
  const [newStudentData, setNewStudentData] = useState({
    email: "",
    fullName: "",
    phone: "",
    studentCode: "",
    academicYear: "",
    academicClassId: "",
  });

  useEffect(() => {
    dispatch(fetchStudentsByInstructor(currentUser?.userInstructor?.id));
    dispatch(fetchCoursesByInstructor(currentUser?.userInstructor?.id));
  }, [dispatch, currentUser]);

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

  // Tạo danh sách các lớp học duy nhất dựa trên academicClassId
  const classOptions = React.useMemo(() => {
    const uniqueClasses = new Map<string, string>();

    // Thêm tùy chọn "Tất cả"
    uniqueClasses.set("Tất cả", "Tất cả");

    // Thu thập các lớp học từ dữ liệu sinh viên học thuật
    instructorStudents.forEach((student) => {
      if (
        student.role === "student_academic" &&
        student.userStudentAcademic?.academicClassId &&
        student.userStudentAcademic?.academicClass?.className
      ) {
        uniqueClasses.set(
          student.userStudentAcademic.academicClassId,
          student.userStudentAcademic.academicClass.className
        );
      }
    });

    // Chuyển đổi Map thành mảng các object để dễ dàng sử dụng trong UI
    return Array.from(uniqueClasses.entries()).map(([id, name]) => ({
      id: id,
      name: name,
    }));
  }, [instructorStudents]);

  // Thu thập các khóa học mà giảng viên đang giảng dạy
  const courseOptions = React.useMemo(() => {
    const uniqueCourses = new Map<string, string>();

    // Thêm tùy chọn "Tất cả"
    uniqueCourses.set("Tất cả", "Tất cả");

    // Thu thập các khóa học từ instructorCourses thay vì từ dữ liệu sinh viên
    instructorCourses.forEach((course) => {
      if (course.id && course.title) {
        uniqueCourses.set(course.id, course.title);
      }
    });

    return Array.from(uniqueCourses.entries()).map(([id, title]) => ({
      id: id,
      name: title,
    }));
  }, [instructorCourses]);

  const filteredStudents = instructorStudents
    .filter((student) => {
      // Lọc theo loại học viên (student hoặc student_academic)
      if (studentType === "student" && student.role !== "student") return false;
      if (
        studentType === "student_academic" &&
        student.role !== "student_academic"
      )
        return false;

      // Lọc theo trạng thái
      if (statusFilter !== "all" && student.status !== statusFilter)
        return false;

      // Lọc theo lớp học dựa trên academicClassId
      if (filterClassId !== "Tất cả") {
        if (student.role === "student_academic") {
          // Lọc sinh viên học thuật theo ID lớp
          if (student.userStudentAcademic?.academicClassId !== filterClassId) {
            return false;
          }
        } else if (student.role === "student") {
          // Lọc sinh viên thường theo ID khóa học
          const isInCourse = student.enrollments?.some(
            (enrollment) => enrollment.courseId === filterClassId
          );
          if (!isInCourse) {
            return false;
          }
        }
      }

      // Tìm kiếm theo tên, email hoặc mã sinh viên
      return (
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.role === "student" &&
          student.userStudent?.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (student.role === "student_academic" &&
          student.userStudentAcademic?.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (student.role === "student_academic" &&
          student.userStudentAcademic?.studentCode
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        const nameA =
          a.role === "student"
            ? a.userStudent?.fullName
            : a.userStudentAcademic?.fullName;
        const nameB =
          b.role === "student"
            ? b.userStudent?.fullName
            : b.userStudentAcademic?.fullName;
        return nameA.localeCompare(nameB);
      }
      if (sortBy === "joinDate") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortBy === "enrolledCourses") {
        return (b.enrollments?.length || 0) - (a.enrollments?.length || 0);
      }
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

            {/* Hiển thị bộ lọc lớp học dựa theo loại sinh viên */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="class-filter-label">
                {studentType === "student_academic" ? "Lớp học" : "Khóa học"}
              </InputLabel>
              <Select
                labelId="class-filter-label"
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                label={
                  studentType === "student_academic" ? "Lớp học" : "Khóa học"
                }
              >
                <MenuItem value="Tất cả">Tất cả</MenuItem>
                {studentType === "student_academic"
                  ? classOptions
                      .filter((option) => option.id !== "Tất cả")
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))
                  : courseOptions
                      .filter((option) => option.id !== "Tất cả")
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
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
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  <TableCell>Khóa học đã đăng ký</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((student) => {
                  // Xác định thông tin người dùng dựa trên loại học viên
                  const fullName =
                    student.role === "student"
                      ? student.userStudent?.fullName
                      : student.userStudentAcademic?.fullName;

                  const avatar = student.avatarUrl || "/default-avatar.png";

                  // Đếm số khóa học đã đăng ký
                  const totalEnrolled = student.enrollments?.length || 0;

                  // Thông tin bổ sung cho sinh viên học thuật
                  const academicInfo =
                    student.role === "student_academic" ? (
                      <>
                        <div>
                          Mã SV: {student.userStudentAcademic?.studentCode}
                        </div>
                        <div>
                          Lớp:{" "}
                          {
                            student.userStudentAcademic?.academicClass
                              ?.className
                          }
                        </div>
                      </>
                    ) : null;

                  return (
                    <TableRow
                      key={student.id}
                      hover
                      onClick={() => handleRowClick(student)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar src={avatar} />
                          <Box>
                            <Typography variant="subtitle2">
                              {fullName}
                            </Typography>
                            {academicInfo}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(student.status)}
                          color={getStatusColor(student.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(student.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>{totalEnrolled}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, student);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        <MenuItem onClick={() => handleOpenDialog(selectedStudent)}>
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

                  {selectedStudent?.role === "student" ? (
                    // Thông tin cho sinh viên thường
                    <>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn />
                        </ListItemIcon>
                        <ListItemText
                          primary="Địa chỉ"
                          secondary={
                            selectedStudent?.userStudent?.address || "-"
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationCity />
                        </ListItemIcon>
                        <ListItemText
                          primary="Thành phố"
                          secondary={selectedStudent?.userStudent?.city || "-"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <School />
                        </ListItemIcon>
                        <ListItemText
                          primary="Trình độ học vấn"
                          secondary={
                            selectedStudent?.userStudent?.educationLevel || "-"
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Work />
                        </ListItemIcon>
                        <ListItemText
                          primary="Nghề nghiệp"
                          secondary={
                            selectedStudent?.userStudent?.occupation || "-"
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <BubbleChart />
                        </ListItemIcon>
                        <ListItemText
                          primary="Sở thích"
                          secondary={
                            selectedStudent?.userStudent?.interests || "-"
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <School />
                        </ListItemIcon>
                        <ListItemText
                          primary="Số khóa học đã đăng ký"
                          secondary={selectedStudent?.enrollments?.length || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle />
                        </ListItemIcon>
                        <ListItemText
                          primary="Số khóa học đã hoàn thành"
                          secondary={
                            selectedStudent?.enrollments?.filter(
                              (e) => e.status === "completed"
                            )?.length || 0
                          }
                        />
                      </ListItem>
                    </>
                  ) : (
                    // Thông tin cho sinh viên học thuật
                    <>
                      <ListItem>
                        <ListItemIcon>
                          <Badge />
                        </ListItemIcon>
                        <ListItemText
                          primary="Mã sinh viên"
                          secondary={
                            selectedStudent?.userStudentAcademic?.studentCode ||
                            "-"
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <School />
                        </ListItemIcon>
                        <ListItemText
                          primary="Lớp"
                          secondary={
                            selectedStudent?.userStudentAcademic?.academicClass
                              ?.className || "-"
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Class />
                        </ListItemIcon>
                        <ListItemText
                          primary="Khóa"
                          secondary={
                            selectedStudent?.userStudentAcademic
                              ?.academicYear || "-"
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Info />
                        </ListItemIcon>
                        <ListItemText
                          primary="Trạng thái học tập"
                          secondary={
                            selectedStudent?.userStudentAcademic?.status ===
                            "studying"
                              ? "Đang học"
                              : selectedStudent?.userStudentAcademic?.status ||
                                "-"
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <School />
                        </ListItemIcon>
                        <ListItemText
                          primary="Số khóa học đã đăng ký"
                          secondary={selectedStudent?.enrollments?.length || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle />
                        </ListItemIcon>
                        <ListItemText
                          primary="Số khóa học đã hoàn thành"
                          secondary={
                            selectedStudent?.enrollments?.filter(
                              (e) => e.status === "completed"
                            )?.length || 0
                          }
                        />
                      </ListItem>
                    </>
                  )}

                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ngày tham gia"
                      secondary={
                        selectedStudent?.createdAt
                          ? new Date(
                              selectedStudent.createdAt
                            ).toLocaleDateString("vi-VN")
                          : "-"
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText
                      primary="Hoạt động gần đây"
                      secondary={
                        selectedStudent?.lastLogin
                          ? new Date(
                              selectedStudent.lastLogin
                            ).toLocaleDateString("vi-VN")
                          : "-"
                      }
                    />
                  </ListItem>
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {selectedStudent?.enrollments?.length > 0 ? (
                  <div>
                    {/* Tiêu đề phần */}
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: "medium" }}
                    >
                      Có {selectedStudent.enrollments.length} khóa học
                    </Typography>

                    {/* Danh sách khóa học */}
                    {selectedStudent.enrollments.map((enrollment: any) => (
                      <Card key={enrollment.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                          >
                            <Avatar
                              src={enrollment.course?.thumbnailUrl}
                              variant="rounded"
                              sx={{ width: 60, height: 60 }}
                            >
                              {enrollment.course?.title
                                ? enrollment.course.title.charAt(0)
                                : "C"}
                            </Avatar>

                            <Stack spacing={1} sx={{ flex: 1 }}>
                              <Typography variant="h6">
                                {enrollment.course?.title || "Không có tiêu đề"}
                              </Typography>

                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Ngày đăng ký:{" "}
                                  {new Date(
                                    enrollment.enrollmentDate
                                  ).toLocaleDateString("vi-VN")}
                                </Typography>

                                <Chip
                                  label={
                                    enrollment.status === "active"
                                      ? "Đang học"
                                      : enrollment.status === "completed"
                                      ? "Đã hoàn thành"
                                      : enrollment.status === "dropped"
                                      ? "Đã hủy"
                                      : "Không xác định"
                                  }
                                  color={
                                    enrollment.status === "active"
                                      ? "primary"
                                      : enrollment.status === "completed"
                                      ? "success"
                                      : enrollment.status === "dropped"
                                      ? "error"
                                      : "default"
                                  }
                                  size="small"
                                />
                              </Stack>

                              {enrollment.status === "completed" &&
                                enrollment.completionDate && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Ngày hoàn thành:{" "}
                                    {new Date(
                                      enrollment.completionDate
                                    ).toLocaleDateString("vi-VN")}
                                  </Typography>
                                )}

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  overflow: "hidden",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                  mt: 1,
                                }}
                              >
                                {enrollment.course?.description ||
                                  "Không có mô tả"}
                              </Typography>

                              <Box sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={1}>
                                  <Chip
                                    size="small"
                                    label={
                                      enrollment.course?.level
                                        ? enrollment.course.level === "beginner"
                                          ? "Cơ bản"
                                          : enrollment.course.level ===
                                            "intermediate"
                                          ? "Trung cấp"
                                          : enrollment.course.level ===
                                            "advanced"
                                          ? "Nâng cao"
                                          : enrollment.course.level
                                        : "Không xác định"
                                    }
                                    variant="outlined"
                                  />

                                  {enrollment.course?.price && (
                                    <Chip
                                      size="small"
                                      label={`${parseInt(
                                        enrollment.course.price
                                      ).toLocaleString("vi-VN")}đ`}
                                      variant="outlined"
                                    />
                                  )}
                                </Stack>
                              </Box>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                {selectedStudent?.enrollments?.some(
                  (enrollment) => enrollment.grades?.length > 0
                ) ? (
                  selectedStudent.enrollments
                    .filter((enrollment) => enrollment.grades?.length > 0)
                    .map((enrollment) => {
                      // Tính điểm tổng dựa trên trọng số và thang điểm tối đa - PHƯƠNG PHÁP ĐỒNG NHẤT
                      let totalWeightedScore = 0;
                      let totalWeight = 0;

                      enrollment.grades.forEach((grade) => {
                        const score = parseFloat(grade.score);
                        const maxScore = parseFloat(grade.maxScore);
                        const weight = parseFloat(grade.weight);

                        // Chuẩn hóa điểm theo thang 100 trước khi nhân với trọng số
                        const weightedScore = (score / maxScore) * 100 * weight;

                        totalWeightedScore += weightedScore;
                        totalWeight += weight;
                      });

                      // Chuẩn hóa điểm cuối cùng - sử dụng toFixed(2) để đảm bảo hiển thị 2 chữ số thập phân
                      const finalGrade =
                        totalWeight > 0
                          ? parseFloat(
                              (totalWeightedScore / totalWeight).toFixed(2)
                            )
                          : 0;

                      // Sắp xếp điểm theo trọng số từ cao đến thấp
                      const sortedGrades = [...enrollment.grades].sort(
                        (a, b) => parseFloat(b.weight) - parseFloat(a.weight)
                      );

                      return (
                        <Card key={enrollment.course?.id} sx={{ mb: 2, p: 3 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                          >
                            {enrollment.course?.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            gutterBottom
                          >
                            Cập nhật: {new Date().toLocaleDateString("vi-VN")}
                          </Typography>

                          <Divider sx={{ my: 2 }} />

                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            gutterBottom
                          >
                            Điểm tổng kết:{" "}
                            <Box component="span" fontWeight="bold">
                              {finalGrade}/100
                            </Box>
                          </Typography>

                          {sortedGrades.map((grade) => {
                            const scorePart =
                              grade.gradeType === "participation"
                                ? `${parseFloat(grade.score)}/${parseFloat(
                                    grade.maxScore
                                  )}`
                                : `${parseFloat(grade.score)}/100`;

                            const weightPart = `(x${parseFloat(
                              grade.weight
                            ).toFixed(2)})`;

                            return (
                              <Box
                                key={grade.id}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  py: 0.5,
                                }}
                              >
                                <Typography>
                                  {grade.gradeType === "midterm" &&
                                    "Điểm giữa khóa:"}
                                  {grade.gradeType === "final" &&
                                    "Điểm cuối khóa:"}
                                  {grade.gradeType === "assignment" &&
                                    (grade.lesson?.title || "Bài tập:")}
                                  {grade.gradeType === "quiz" &&
                                    (grade.lesson?.title || "Bài kiểm tra:")}
                                  {grade.gradeType === "participation" &&
                                    "Điểm tham gia:"}
                                  {![
                                    "midterm",
                                    "final",
                                    "assignment",
                                    "quiz",
                                    "participation",
                                  ].includes(grade.gradeType) &&
                                    grade.gradeType}
                                </Typography>
                                <Typography>
                                  {scorePart} {weightPart}
                                </Typography>
                              </Box>
                            );
                          })}

                          <Box sx={{ mt: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(finalGrade / 100) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 1,
                                bgcolor: "grey.200",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor:
                                    finalGrade >= 80
                                      ? "success.main"
                                      : finalGrade >= 60
                                      ? "warning.main"
                                      : "error.main",
                                },
                              }}
                            />
                          </Box>
                        </Card>
                      );
                    })
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
