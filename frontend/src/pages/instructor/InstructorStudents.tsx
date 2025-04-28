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
} from "@mui/material";
import {
  Search,
  MoreVert,
  Person,
  Email,
  Phone,
  School,
  CalendarToday,
  LocationOn,
  AccessTime,
  Close,
  LocationCity,
  Work,
  BubbleChart,
  CheckCircle,
  Badge,
  Class,
  Info,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchAcademicStudentsByInstructor,
  fetchStudentsByInstructor,
} from "../../features/users/usersApiSlice";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  selectInstructorAcademicStudents,
  selectInstructorStudents,
} from "../../features/users/usersSelectors";
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
  const instructorAcademicStudents = useAppSelector(
    selectInstructorAcademicStudents
  );
  const instructorCourses = useAppSelector(selectCoursesByInstructor);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState<"student" | "student_academic">(
    "student"
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [filterClassId, setFilterClassId] = useState<string>("Tất cả");

  // Add new state for dialog tabs
  const [dialogTabValue, setDialogTabValue] = useState(0);

  useEffect(() => {
    dispatch(fetchStudentsByInstructor(currentUser?.userInstructor?.id));
    dispatch(fetchCoursesByInstructor(currentUser?.userInstructor?.id));
    dispatch(fetchAcademicStudentsByInstructor(currentUser.userInstructor.id));
  }, [dispatch, currentUser]);

  console.log(instructorAcademicStudents);

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
    instructorAcademicStudents.forEach((student) => {
      if (student.userStudentAcademic?.academicClass) {
        const classInfo = student.userStudentAcademic.academicClass;
        uniqueClasses.set(
          classInfo.id.toString(),
          `${classInfo.className} (${classInfo.classCode})`
        );
      }
    });

    // Chuyển đổi Map thành mảng các object để dễ dàng sử dụng trong UI
    return Array.from(uniqueClasses.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [instructorAcademicStudents]);

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

  // Modify the filtered students logic to handle both types
  const filteredStudents = React.useMemo(() => {
    // Use different source based on tab
    const sourceStudents =
      tabValue === "student_academic"
        ? instructorAcademicStudents
        : instructorStudents.filter((student) => student.role === "student");

    return sourceStudents
      .filter((student) => {
        // Filter by status
        if (statusFilter !== "all" && student.status !== statusFilter) {
          return false;
        }

        // Filter by class/course
        if (filterClassId !== "Tất cả") {
          if (tabValue === "student_academic") {
            if (
              student.userStudentAcademic?.academicClassId !== filterClassId
            ) {
              return false;
            }
          } else {
            const isInCourse = student.enrollments?.some(
              (enrollment) => enrollment.courseId === filterClassId
            );
            if (!isInCourse) {
              return false;
            }
          }
        }

        // Search logic
        const searchFields =
          tabValue === "student_academic"
            ? [
                student.email,
                student.userStudentAcademic?.fullName,
                student.userStudentAcademic?.studentCode,
              ]
            : [student.email, student.userStudent?.fullName];

        return searchFields.some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          const nameA =
            tabValue === "student_academic"
              ? a.userStudentAcademic?.fullName
              : a.userStudent?.fullName;
          const nameB =
            tabValue === "student_academic"
              ? b.userStudentAcademic?.fullName
              : b.userStudent?.fullName;
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
  }, [
    tabValue,
    instructorStudents,
    instructorAcademicStudents,
    statusFilter,
    filterClassId,
    searchQuery,
    sortBy,
  ]);

  const handleOpenDialog = (student: any) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
    setDialogTabValue(0); // Reset to first tab
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

  const paginatedStudents = filteredStudents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Thêm hàm xử lý sự kiện click vào sinh viên
  const handleRowClick = (student: any) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  // Add handleTabChange function
  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: "student" | "student_academic"
  ) => {
    setTabValue(newValue);
    // Reset other filters when changing tabs
    setPage(1);
    setSearchQuery("");
    setFilterClassId("Tất cả");
  };

  // Add new handler for dialog tabs
  const handleDialogTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setDialogTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Quản lý học viên/sinh viên
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

            {/* Conditional filter based on tab value */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>
                {tabValue === "student_academic" ? "Lớp học" : "Khóa học"}
              </InputLabel>
              <Select
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                label={tabValue === "student_academic" ? "Lớp học" : "Khóa học"}
              >
                <MenuItem value="Tất cả">Tất cả</MenuItem>
                {tabValue === "student_academic"
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

          <Box sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: -1 }}>
              <Tab
                value="student"
                label="Học viên bên ngoài"
                icon={<Person sx={{ mr: 1 }} />}
                iconPosition="start"
              />
              <Tab
                value="student_academic"
                label="Sinh viên trường"
                icon={<School sx={{ mr: 1 }} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  <TableCell>
                    {tabValue === "student"
                      ? "Khóa học đã đăng ký"
                      : "Khóa học tham gia"}
                  </TableCell>
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
                  const totalEnrolled =
                    student.enrollments?.length ||
                    student.userStudentAcademic.academicClass.classCourses
                      .length;

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
            <Typography variant="h6">Chi tiết học viên/sinh viên</Typography>
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
                value={dialogTabValue}
                onChange={handleDialogTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Thông tin cá nhân" />
                <Tab label="Khóa học" />
                <Tab label="Điểm số" />
              </Tabs>

              <TabPanel value={dialogTabValue} index={0}>
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

              <TabPanel value={dialogTabValue} index={1}>
                {selectedStudent?.role === "student_academic" ? (
                  // Show academic class courses
                  selectedStudent?.userStudentAcademic?.academicClass
                    ?.classCourses?.length > 0 ? (
                    <div>
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 2, fontWeight: "medium" }}
                      >
                        Có{" "}
                        {
                          selectedStudent.userStudentAcademic.academicClass
                            .classCourses.length
                        }{" "}
                        khóa học
                      </Typography>

                      {selectedStudent.userStudentAcademic.academicClass.classCourses.map(
                        (classCourse: any) => (
                          <Card key={classCourse.id} sx={{ mb: 2 }}>
                            <CardContent>
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="flex-start"
                              >
                                <Avatar
                                  src={classCourse.course?.thumbnailUrl}
                                  variant="rounded"
                                  sx={{ width: 60, height: 60 }}
                                >
                                  {classCourse.course?.title
                                    ? classCourse.course.title.charAt(0)
                                    : "C"}
                                </Avatar>

                                <Stack spacing={1} sx={{ flex: 1 }}>
                                  <Typography variant="h6">
                                    {classCourse.course?.title ||
                                      "Không có tiêu đề"}
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
                                      Ngày bắt đầu:{" "}
                                      {new Date(
                                        classCourse.course?.startDate
                                      ).toLocaleDateString("vi-VN")}
                                    </Typography>

                                    <Chip
                                      label={
                                        classCourse.course?.status ===
                                        "published"
                                          ? "Đang học"
                                          : "Chưa bắt đầu"
                                      }
                                      color={
                                        classCourse.course?.status ===
                                        "published"
                                          ? "primary"
                                          : "default"
                                      }
                                      size="small"
                                    />
                                  </Stack>

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
                                    {classCourse.course?.description ||
                                      "Không có mô tả"}
                                  </Typography>

                                  <Box sx={{ mt: 1 }}>
                                    <Stack direction="row" spacing={1}>
                                      <Chip
                                        size="small"
                                        label={
                                          classCourse.course?.level ===
                                          "beginner"
                                            ? "Cơ bản"
                                            : classCourse.course?.level ===
                                              "intermediate"
                                            ? "Trung cấp"
                                            : classCourse.course?.level ===
                                              "advanced"
                                            ? "Nâng cao"
                                            : "Không xác định"
                                        }
                                        variant="outlined"
                                      />

                                      <Chip
                                        size="small"
                                        label={`Kết thúc: ${new Date(
                                          classCourse.course?.endDate
                                        ).toLocaleDateString("vi-VN")}`}
                                        variant="outlined"
                                      />
                                    </Stack>
                                  </Box>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  ) : (
                    <Typography
                      color="text.secondary"
                      align="center"
                      sx={{ py: 3 }}
                    >
                      Chưa có khóa học nào
                    </Typography>
                  )
                ) : // Show regular enrollment courses (existing code)
                selectedStudent?.enrollments?.length > 0 ? (
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

              <TabPanel value={dialogTabValue} index={2}>
                {selectedStudent?.role === "student_academic" ? (
                  selectedStudent?.userGrades?.length > 0 ? (
                    <Card sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Bảng điểm sinh viên
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

                      {/* Sắp xếp điểm theo trọng số */}
                      {[...selectedStudent.userGrades] // Create new array before sorting
                        .sort(
                          (a, b) => parseFloat(b.weight) - parseFloat(a.weight)
                        )
                        .map((grade) => (
                          <Box
                            key={grade.id}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              py: 0.5,
                            }}
                          >
                            <Typography>
                              {grade.gradeType === "assignment" &&
                                grade.assignmentSubmission?.assignment.title}
                              {grade.gradeType === "quiz" &&
                                grade.quizAttempt?.quiz.title}
                              {grade.gradeType === "midterm" && "Điểm giữa kỳ"}
                              {grade.gradeType === "final" && "Điểm cuối kỳ"}
                            </Typography>
                            <Box>
                              <Typography component="span">
                                {grade.score}/{grade.maxScore}
                              </Typography>
                              <Typography
                                component="span"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                              >
                                (x{parseFloat(grade.weight).toFixed(2)})
                              </Typography>
                            </Box>
                          </Box>
                        ))}

                      {/* Tính và hiển thị điểm tổng kết */}
                      {(() => {
                        let totalWeightedScore = 0;
                        let totalWeight = 0;

                        selectedStudent.userGrades.forEach((grade) => {
                          const score = parseFloat(grade.score);
                          const maxScore = parseFloat(grade.maxScore);
                          const weight = parseFloat(grade.weight);

                          const weightedScore =
                            (score / maxScore) * 100 * weight;
                          totalWeightedScore += weightedScore;
                          totalWeight += weight;
                        });

                        const finalGrade =
                          totalWeight > 0
                            ? parseFloat(
                                (totalWeightedScore / totalWeight).toFixed(2)
                              )
                            : 0;

                        return (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Điểm tổng kết:{" "}
                              <Box component="span" fontWeight="bold">
                                {finalGrade}/100
                              </Box>
                            </Typography>
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
                          </>
                        );
                      })()}
                    </Card>
                  ) : (
                    <Typography
                      color="text.secondary"
                      align="center"
                      sx={{ py: 3 }}
                    >
                      Chưa có thông tin điểm
                    </Typography>
                  )
                ) : // Existing code for regular students
                selectedStudent?.enrollments?.some(
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
                            const scorePart = `${parseFloat(
                              grade.score
                            )}/${parseFloat(grade.maxScore)}`;
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
                                    (grade.lesson?.title || "Bài trắc nghiệm:")}
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
