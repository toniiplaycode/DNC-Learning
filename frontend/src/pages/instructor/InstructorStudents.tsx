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
  Link,
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
  EventBusy,
  Grade,
  Warning,
  Settings,
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
import * as XLSX from "xlsx";
import EditStudentStatusDialog from "./component/EditStudentStatusDialog";
import { toast } from "react-toastify";
import { createNotification } from "../../features/notifications/notificationsSlice";

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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Add new state for dialog tabs
  const [dialogTabValue, setDialogTabValue] = useState(0);

  // Add new state for warning email dialog
  const [warningEmailDialogOpen, setWarningEmailDialogOpen] = useState(false);
  const [selectedGradeInfo, setSelectedGradeInfo] = useState<{
    courseTitle: string;
    finalGrade: number;
    studentName: string;
    studentEmail: string;
    threshold: number;
  } | null>(null);

  // Add new state for warning threshold
  const [warningThreshold, setWarningThreshold] = useState(60);
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);

  console.log(instructorAcademicStudents);

  useEffect(() => {
    if (currentUser?.userInstructor?.id) {
      const instructorId = parseInt(currentUser.userInstructor.id);
      if (!isNaN(instructorId)) {
        dispatch(fetchStudentsByInstructor(instructorId));
        dispatch(fetchCoursesByInstructor(instructorId));
        dispatch(fetchAcademicStudentsByInstructor(instructorId));
      }
    }
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
    uniqueCourses.set("Tất cả", "Tất cả");

    instructorCourses.forEach((course) => {
      if (course.id && course.title) {
        uniqueCourses.set(course.id.toString(), course.title);
      }
    });

    return Array.from(uniqueCourses.entries()).map(([id, title]) => ({
      id,
      name: title,
    }));
  }, [instructorCourses]);

  // Modify the filtered students logic to handle both types
  const filteredStudents = React.useMemo(() => {
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
            const studentClassId =
              student.userStudentAcademic?.academicClassId?.toString();
            if (studentClassId !== filterClassId) {
              return false;
            }
          } else {
            const isInCourse = student.enrollments?.some(
              (enrollment) => enrollment.courseId?.toString() === filterClassId
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
          // Sort by first name (last word in fullName)
          const firstNameA = (nameA || "").trim().split(" ").pop() || "";
          const firstNameB = (nameB || "").trim().split(" ").pop() || "";
          return firstNameA.localeCompare(firstNameB, "vi", {
            sensitivity: "base",
          });
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

  // Export filtered students to Excel
  const handleExportStudents = () => {
    if (!filteredStudents.length) {
      alert("Không có học viên/sinh viên để xuất file!");
      return;
    }
    // filteredStudents đã được sort theo sortBy
    const data = filteredStudents.map((student, idx) => {
      if (tabValue === "student_academic") {
        return {
          STT: idx + 1,
          "Mã sinh viên": student.userStudentAcademic?.studentCode || "",
          "Họ và tên": student.userStudentAcademic?.fullName || "",
          Khóa: student.userStudentAcademic?.academicYear || "",
          Email: student.email || "",
          "Số điện thoại":
            student.userStudentAcademic?.phone || student.phone || "",
          "Trạng thái":
            student.userStudentAcademic?.status === "studying"
              ? "Đang học"
              : student.userStudentAcademic?.status || "-",
          Lớp: student.userStudentAcademic?.academicClass?.className || "",
          "Ngày tham gia": student.createdAt
            ? new Date(student.createdAt).toLocaleDateString("vi-VN")
            : "",
          "Khóa học tham gia":
            student.userStudentAcademic.academicClass.classCourses.length,
        };
      } else {
        return {
          STT: idx + 1,
          "Mã học viên": student.userStudent?.studentCode || "",
          "Họ và tên": student.userStudent?.fullName || "",
          Email: student.email || "",
          "Số điện thoại": student.userStudent?.phone || student.phone || "",
          "Trạng thái":
            student.status === "active"
              ? "Đang hoạt động"
              : student.status || "-",
          "Ngày tham gia": student.createdAt
            ? new Date(student.createdAt).toLocaleDateString("vi-VN")
            : "",
          "Số khóa học đã đăng ký": student.enrollments?.length || 0,
        };
      }
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocVien");
    XLSX.writeFile(
      wb,
      `DanhSach_${
        tabValue === "student_academic" ? "SinhVien" : "HocVien"
      }.xlsx`
    );
  };

  // Add handler for status update
  const handleStatusUpdate = (student: any) => {
    setSelectedStudent(student);
    setStatusDialogOpen(true);
    setAnchorEl(null);
  };

  // Add handler for status update success
  const handleStatusUpdateSuccess = () => {
    if (!currentUser?.userInstructor?.id || !selectedStudent) return;

    const instructorId = parseInt(currentUser.userInstructor.id);
    if (!isNaN(instructorId)) {
      if (selectedStudent.role === "student_academic") {
        dispatch(fetchAcademicStudentsByInstructor(instructorId));
      } else {
        dispatch(fetchStudentsByInstructor(instructorId));
      }
    }
  };

  // Update the handleSendWarningEmail function
  const handleSendWarningEmail = async () => {
    if (!selectedGradeInfo || !selectedStudent) return;

    try {
      const notificationData = {
        userIds: [selectedStudent.id],
        title:
          selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
            ? "Cảnh báo điểm số thấp"
            : "Thông báo điểm số",
        content:
          selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
            ? `Điểm số của bạn trong khóa học "${selectedGradeInfo.courseTitle}" hiện tại là ${selectedGradeInfo.finalGrade}/100, dưới ngưỡng cảnh báo ${selectedGradeInfo.threshold}/100. Vui lòng liên hệ với giảng viên để được hỗ trợ cải thiện điểm số.`
            : `Điểm số của bạn trong khóa học "${selectedGradeInfo.courseTitle}" hiện tại là ${selectedGradeInfo.finalGrade}/100.`,
        type: "message",
      };

      await dispatch(createNotification(notificationData)).unwrap();

      toast.success(
        selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
          ? "Đã gửi email cảnh báo điểm số thành công"
          : "Đã gửi thông báo điểm số thành công"
      );

      // Close dialog after sending
      setWarningEmailDialogOpen(false);
      setSelectedGradeInfo(null);
    } catch (error) {
      console.error("Error sending grade notification:", error);
      toast.error("Có lỗi xảy ra khi gửi thông báo. Vui lòng thử lại sau.");
    }
  };

  // Add handler for updating threshold
  const handleUpdateThreshold = (newThreshold: number) => {
    setWarningThreshold(newThreshold);
    setThresholdDialogOpen(false);
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

            <Button
              variant="outlined"
              color="success"
              onClick={handleExportStudents}
              sx={{ minWidth: 180 }}
            >
              Tải danh sách{" "}
              {tabValue === "student_academic" ? "sinh viên" : "học viên"}
            </Button>
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
                  <TableCell>Thao tác</TableCell>
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
                    Array.isArray(student.enrollments) &&
                    student.enrollments.length > 0
                      ? student.enrollments.length
                      : student.userStudentAcademic?.academicClass?.classCourses
                          ?.length ?? 0;

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
                      <TableCell>
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
          <Person sx={{ mr: 1 }} color="primary" fontSize="small" />
          Xem thông tin
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(selectedStudent)}>
          <Info sx={{ mr: 1 }} color="info" fontSize="small" />
          Cập nhật trạng thái
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
                {selectedStudent?.role === "student_academic" && (
                  <Tab label="Điểm danh" />
                )}
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
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 8,
                        px: 2,
                        textAlign: "center",
                      }}
                    >
                      <School
                        sx={{
                          fontSize: 64,
                          color: "text.secondary",
                          mb: 2,
                          opacity: 0.5,
                        }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                        sx={{ fontWeight: "medium" }}
                      >
                        Chưa có khóa học
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 400 }}
                      >
                        Sinh viên chưa được đăng ký vào bất kỳ khóa học nào.
                        Thông tin khóa học sẽ được hiển thị tại đây khi sinh
                        viên được thêm vào các khóa học.
                      </Typography>
                    </Box>
                  )
                ) : // Show regular enrollment courses
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
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 8,
                      px: 2,
                      textAlign: "center",
                    }}
                  >
                    <School
                      sx={{
                        fontSize: 64,
                        color: "text.secondary",
                        mb: 2,
                        opacity: 0.5,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontWeight: "medium" }}
                    >
                      Chưa có khóa học
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 400 }}
                    >
                      Học viên chưa đăng ký tham gia bất kỳ khóa học nào. Thông
                      tin khóa học sẽ được hiển thị tại đây khi học viên đăng ký
                      các khóa học.
                    </Typography>
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={dialogTabValue} index={2}>
                {selectedStudent?.role === "student_academic" ? (
                  selectedStudent?.userGrades?.length > 0 ? (
                    <Card sx={{ p: 3 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          Bảng điểm sinh viên
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Settings />}
                            onClick={() => setThresholdDialogOpen(true)}
                            size="small"
                          >
                            Ngưỡng cảnh báo: {warningThreshold}/100
                          </Button>
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
                                    (totalWeightedScore / totalWeight).toFixed(
                                      2
                                    )
                                  )
                                : 0;

                            return (
                              <Button
                                variant="outlined"
                                color={
                                  finalGrade < warningThreshold
                                    ? "warning"
                                    : "primary"
                                }
                                startIcon={<Warning />}
                                onClick={() => {
                                  setSelectedGradeInfo({
                                    courseTitle: "Tất cả các môn học",
                                    finalGrade,
                                    studentName:
                                      selectedStudent.userStudentAcademic
                                        ?.fullName || "",
                                    studentEmail: selectedStudent.email || "",
                                    threshold: warningThreshold,
                                  });
                                  setWarningEmailDialogOpen(true);
                                }}
                              >
                                {finalGrade < warningThreshold
                                  ? "Gửi cảnh báo điểm số"
                                  : "Gửi thông báo điểm số"}
                              </Button>
                            );
                          })()}
                        </Stack>
                      </Stack>

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
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 8,
                        px: 2,
                        textAlign: "center",
                      }}
                    >
                      <Grade
                        sx={{
                          fontSize: 64,
                          color: "text.secondary",
                          mb: 2,
                          opacity: 0.5,
                        }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                        sx={{ fontWeight: "medium" }}
                      >
                        Chưa có thông tin điểm
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 400 }}
                      >
                        Sinh viên chưa có bất kỳ bản ghi điểm nào trong hệ
                        thống. Thông tin điểm số sẽ được hiển thị tại đây khi
                        giảng viên cập nhật điểm cho sinh viên.
                      </Typography>
                    </Box>
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
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="h6" fontWeight="bold">
                              {enrollment.course?.title}
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={1} sx={{ py: 1 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<Settings />}
                              onClick={() => setThresholdDialogOpen(true)}
                              size="small"
                            >
                              Ngưỡng cảnh báo: {warningThreshold}/100
                            </Button>
                            <Button
                              variant="outlined"
                              color={
                                finalGrade < warningThreshold
                                  ? "warning"
                                  : "primary"
                              }
                              startIcon={<Warning />}
                              onClick={() => {
                                setSelectedGradeInfo({
                                  courseTitle: enrollment.course?.title || "",
                                  finalGrade,
                                  studentName:
                                    selectedStudent.userStudent?.fullName || "",
                                  studentEmail: selectedStudent.email || "",
                                  threshold: warningThreshold,
                                });
                                setWarningEmailDialogOpen(true);
                              }}
                            >
                              {finalGrade < warningThreshold
                                ? "Gửi cảnh báo điểm số"
                                : "Gửi thông báo điểm số"}
                            </Button>
                          </Stack>

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
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 8,
                      px: 2,
                      textAlign: "center",
                    }}
                  >
                    <Grade
                      sx={{
                        fontSize: 64,
                        color: "text.secondary",
                        mb: 2,
                        opacity: 0.5,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontWeight: "medium" }}
                    >
                      Chưa có thông tin điểm
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 400 }}
                    >
                      Học viên chưa có bất kỳ bản ghi điểm nào trong hệ thống.
                      Thông tin điểm số sẽ được hiển thị tại đây khi giảng viên
                      cập nhật điểm cho học viên.
                    </Typography>
                  </Box>
                )}
              </TabPanel>

              {selectedStudent?.role === "student_academic" && (
                <TabPanel value={dialogTabValue} index={3}>
                  {selectedStudent?.userStudentAcademic?.sessionAttendances
                    ?.length > 0 ? (
                    <Card sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Lịch sử điểm danh
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

                      {selectedStudent.userStudentAcademic.sessionAttendances
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((attendance) => (
                          <Card key={attendance.id} sx={{ mb: 2 }}>
                            <CardContent>
                              <Stack spacing={2}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography variant="h6">
                                    {attendance.teachingSchedule?.title}
                                  </Typography>
                                  <Chip
                                    label={
                                      attendance.status === "present"
                                        ? "Có mặt"
                                        : attendance.status === "absent"
                                        ? "Vắng mặt"
                                        : attendance.status === "late"
                                        ? "Đi muộn"
                                        : "Không xác định"
                                    }
                                    color={
                                      attendance.status === "present"
                                        ? "success"
                                        : attendance.status === "absent"
                                        ? "error"
                                        : attendance.status === "late"
                                        ? "warning"
                                        : "default"
                                    }
                                    size="small"
                                  />
                                </Stack>

                                <Stack spacing={1}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Thời gian:{" "}
                                    {new Date(
                                      attendance.teachingSchedule?.startTime
                                    ).toLocaleString("vi-VN")}{" "}
                                    -{" "}
                                    {new Date(
                                      attendance.teachingSchedule?.endTime
                                    ).toLocaleString("vi-VN")}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Thời gian tham gia:{" "}
                                    {new Date(
                                      attendance.joinTime
                                    ).toLocaleString("vi-VN")}{" "}
                                    -{" "}
                                    {new Date(
                                      attendance.leaveTime
                                    ).toLocaleString("vi-VN")}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Thời lượng tham gia:{" "}
                                    {attendance.durationMinutes} phút
                                  </Typography>

                                  {attendance.notes && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Ghi chú: {attendance.notes}
                                    </Typography>
                                  )}

                                  {attendance.teachingSchedule?.meetingLink && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Link buổi học:{" "}
                                      <Link
                                        href={
                                          attendance.teachingSchedule
                                            .meetingLink
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {
                                          attendance.teachingSchedule
                                            .meetingLink
                                        }
                                      </Link>
                                    </Typography>
                                  )}
                                </Stack>

                                <Box sx={{ mt: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={
                                      (attendance.durationMinutes /
                                        ((new Date(
                                          attendance.teachingSchedule?.endTime
                                        ).getTime() -
                                          new Date(
                                            attendance.teachingSchedule?.startTime
                                          ).getTime()) /
                                          (1000 * 60))) *
                                      100
                                    }
                                    sx={{
                                      height: 8,
                                      borderRadius: 1,
                                      bgcolor: "grey.200",
                                      "& .MuiLinearProgress-bar": {
                                        bgcolor:
                                          attendance.status === "present"
                                            ? "success.main"
                                            : attendance.status === "late"
                                            ? "warning.main"
                                            : "error.main",
                                      },
                                    }}
                                  />
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}

                      {/* Tính và hiển thị tỷ lệ điểm danh */}
                      {(() => {
                        const attendances =
                          selectedStudent.userStudentAcademic
                            .sessionAttendances;
                        const totalSessions = attendances.length;
                        const presentSessions = attendances.filter(
                          (a) => a.status === "present" || a.status === "late"
                        ).length;
                        const attendanceRate =
                          (presentSessions / totalSessions) * 100;

                        return (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Tỷ lệ điểm danh:{" "}
                              <Box component="span" fontWeight="bold">
                                {attendanceRate.toFixed(1)}%
                              </Box>
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={attendanceRate}
                                sx={{
                                  height: 8,
                                  borderRadius: 1,
                                  bgcolor: "grey.200",
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor:
                                      attendanceRate >= 80
                                        ? "success.main"
                                        : attendanceRate >= 60
                                        ? "warning.main"
                                        : "error.main",
                                  },
                                }}
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              {presentSessions}/{totalSessions} buổi học
                            </Typography>
                          </>
                        );
                      })()}
                    </Card>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 8,
                        px: 2,
                        textAlign: "center",
                      }}
                    >
                      <EventBusy
                        sx={{
                          fontSize: 64,
                          color: "text.secondary",
                          mb: 2,
                          opacity: 0.5,
                        }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                        sx={{ fontWeight: "medium" }}
                      >
                        Chưa có thông tin điểm danh
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 400 }}
                      >
                        Sinh viên chưa có bất kỳ bản ghi điểm danh nào trong hệ
                        thống. Thông tin điểm danh sẽ được hiển thị tại đây khi
                        sinh viên tham gia các buổi học.
                      </Typography>
                    </Box>
                  )}
                </TabPanel>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Add EditStudentStatusDialog */}
      {selectedStudent && (
        <EditStudentStatusDialog
          open={statusDialogOpen}
          onClose={() => {
            setStatusDialogOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}

      {/* Add Threshold Setting Dialog */}
      <Dialog
        open={thresholdDialogOpen}
        onClose={() => setThresholdDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Settings color="primary" />
            <Typography variant="h6">Cài đặt ngưỡng cảnh báo</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Điểm số dưới ngưỡng này sẽ được đánh dấu là cần cảnh báo và gửi
              email thông báo cho sinh viên.
            </Typography>
            <TextField
              label="Ngưỡng điểm cảnh báo"
              type="number"
              value={warningThreshold}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 0 && value <= 100) {
                  setWarningThreshold(value);
                }
              }}
              inputProps={{
                min: 0,
                max: 100,
                step: 1,
              }}
              fullWidth
              helperText="Nhập giá trị từ 0 đến 100"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThresholdDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleUpdateThreshold(warningThreshold)}
          >
            Lưu cài đặt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Warning Email Dialog */}
      <Dialog
        open={warningEmailDialogOpen}
        onClose={() => {
          setWarningEmailDialogOpen(false);
          setSelectedGradeInfo(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Warning
              color={
                selectedGradeInfo &&
                selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
                  ? "warning"
                  : "primary"
              }
            />
            <Typography variant="h6">
              {selectedGradeInfo &&
              selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
                ? "Gửi cảnh báo điểm số"
                : "Gửi thông báo điểm số"}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedGradeInfo && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography>
                Bạn sắp gửi email{" "}
                {selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
                  ? "cảnh báo"
                  : "thông báo"}{" "}
                điểm số cho:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Sinh viên: {selectedGradeInfo.studentName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {selectedGradeInfo.studentEmail}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Khóa học: {selectedGradeInfo.courseTitle}
                </Typography>
                <Typography
                  variant="body2"
                  color={
                    selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
                      ? "error"
                      : "text.secondary"
                  }
                  sx={{ mt: 1 }}
                >
                  Điểm số hiện tại: {selectedGradeInfo.finalGrade}/100
                  {selectedGradeInfo.finalGrade <
                    selectedGradeInfo.threshold && (
                    <Typography component="span" color="error" sx={{ ml: 1 }}>
                      (Dưới ngưỡng cảnh báo {selectedGradeInfo.threshold}/100)
                    </Typography>
                  )}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
                  ? "Email cảnh báo sẽ được gửi đến sinh viên với nội dung thông báo về điểm số thấp và đề xuất các biện pháp cải thiện."
                  : "Email thông báo sẽ được gửi đến sinh viên với nội dung thông báo về điểm số hiện tại."}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setWarningEmailDialogOpen(false);
              setSelectedGradeInfo(null);
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color={
              selectedGradeInfo &&
              selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
                ? "warning"
                : "primary"
            }
            startIcon={<Email />}
            onClick={handleSendWarningEmail}
          >
            {selectedGradeInfo &&
            selectedGradeInfo.finalGrade < selectedGradeInfo.threshold
              ? "Gửi email cảnh báo"
              : "Gửi email thông báo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorStudents;
