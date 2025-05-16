import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Tooltip,
  Badge,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Block,
  CheckCircle,
  Email,
  School,
  Person,
  FilterList,
  Assignment,
  Book,
} from "@mui/icons-material";
import {
  fetchAcademicStudents,
  fetchRegularStudents,
} from "../../features/users/usersApiSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAcademicStudents } from "../../features/users/usersSelectors";
import { selectRegularStudents } from "../../features/users/usersSelectors";
import { User, UserStudentAcademic } from "../../types/user.types";
import { deleteUser } from "../../features/users/usersApiSlice";
import { toast } from "react-toastify";

interface UserGrade {
  id: string;
  gradeType: string;
  score: string;
  maxScore: string;
  weight: string;
  feedback: string | null;
  gradedAt: string;
  assignmentSubmission?: {
    assignment: {
      title: string;
    };
  };
  quizAttempt?: {
    quiz: {
      title: string;
    };
  };
}

// Extend the imported User type
interface ExtendedUser extends User {
  userGrades?: UserGrade[];
}

const AdminStudents = () => {
  const dispatch = useAppDispatch();
  const regularStudents = useAppSelector(selectRegularStudents);
  const academicStudents = useAppSelector(selectAcademicStudents);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchRegularStudents());
    dispatch(fetchAcademicStudents());
  }, [dispatch]);

  // Các tùy chọn lọc
  const classOptions = academicStudents.reduce((acc, student) => {
    const classCode = student.userStudentAcademic?.academicClass?.classCode;
    if (classCode) {
      acc[classCode] = (acc[classCode] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const classes = Object.keys(classOptions).sort((a, b) => b.localeCompare(a));

  // Xử lý chuyển tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
    setSearchQuery("");
    setStatusFilter("all");
    setSelectedStudent(null);
  };

  // Lọc danh sách học viên
  const filteredStudents =
    tabValue === 0
      ? regularStudents.filter((student) => {
          if (statusFilter !== "all" && student.status !== statusFilter)
            return false;
          if (
            searchQuery &&
            !student.userStudent?.fullName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) &&
            !student.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
            return false;
          return true;
        })
      : academicStudents.filter((student) => {
          if (statusFilter !== "all" && student.status !== statusFilter)
            return false;
          if (
            classFilter !== "all" &&
            student.userStudentAcademic?.academicClass?.classCode !==
              classFilter
          )
            return false;
          if (
            searchQuery &&
            !student.userStudentAcademic?.fullName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) &&
            !student.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !student.userStudentAcademic?.studentCode
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
            return false;
          return true;
        });

  // Phân trang
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Xử lý menu thao tác
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Xử lý xem chi tiết
  const handleViewDetails = () => {
    setOpenDetailDialog(true);
    handleMenuClose();
  };

  // Xử lý xóa học viên
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;

    try {
      await dispatch(deleteUser(selectedStudent)).unwrap();
      setSelectedStudent(null);
      toast.success("Xóa sinh viên thành công");
    } catch (error: any) {
      toast.error(error);
    }

    setOpenDeleteDialog(false);
  };

  // Xử lý khóa/mở khóa học viên
  const handleBlockClick = () => {
    setOpenBlockDialog(true);
    handleMenuClose();
  };

  const handleBlockConfirm = () => {
    // Xử lý khóa/mở khóa học viên
    const student =
      tabValue === 0
        ? regularStudents.find((s) => s.id === selectedStudent)
        : academicStudents.find((s) => s.id === selectedStudent);

    console.log(
      `${
        student?.status === "active" ? "Khóa" : "Mở khóa"
      } học viên ID: ${selectedStudent}`
    );
    setOpenBlockDialog(false);
  };

  // Lấy thông tin học viên đang chọn
  const getSelectedStudent = (): ExtendedUser | undefined => {
    return tabValue === 0
      ? regularStudents.find((s) => s.id === selectedStudent)
      : academicStudents.find((s) => s.id === selectedStudent);
  };

  // Format date helper
  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "Không có thông tin";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Calculate grade for a single student
  const calculateStudentGrade = (student: ExtendedUser): string => {
    if (!student.userGrades || student.userGrades.length === 0)
      return "Chưa có điểm";

    const { weightedSum, totalWeight } = student.userGrades.reduce(
      (acc, grade) => {
        // Convert score to 10-point scale
        const score =
          (parseFloat(grade.score) / parseFloat(grade.maxScore)) * 10;
        const weight = parseFloat(grade.weight);
        return {
          weightedSum: acc.weightedSum + score * weight,
          totalWeight: acc.totalWeight + weight,
        };
      },
      { weightedSum: 0, totalWeight: 0 }
    );

    // Calculate final grade on 10-point scale
    const finalGrade = weightedSum / totalWeight;
    return finalGrade.toFixed(2);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={"bold"} gutterBottom>
        Quản lý học viên/sinh viên
      </Typography>

      {/* Tabs chuyển đổi loại học viên */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Person sx={{ mr: 1 }} />
              Học viên bên ngoài
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <School sx={{ mr: 1 }} />
              Sinh viên trường
            </Box>
          }
        />
      </Tabs>

      <Card>
        <CardContent>
          {/* Thanh công cụ */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Tìm kiếm */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={
                  tabValue === 0
                    ? "Tìm kiếm theo tên, email..."
                    : "Tìm kiếm theo tên, mã sinh viên, email..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            {/* Bộ lọc */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="active">Hoạt động</MenuItem>
                    <MenuItem value="inactive">Không hoạt động</MenuItem>
                  </Select>
                </FormControl>

                {tabValue === 1 && (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Lớp</InputLabel>
                    <Select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      label="Lớp"
                    >
                      <MenuItem value="all">
                        Tất cả các lớp ({academicStudents.length} SV)
                      </MenuItem>
                      {classes.map((classCode) => (
                        <MenuItem key={classCode} value={classCode}>
                          {classCode} ({classOptions[classCode]} SV)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Bảng học viên */}
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Học viên</TableCell>
                  {tabValue === 1 && <TableCell>Mã SV</TableCell>}
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  {tabValue === 0 ? (
                    <>
                      <TableCell>Khóa học</TableCell>
                      <TableCell>Ngày tham gia</TableCell>
                      <TableCell>Điểm TB</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>Lớp</TableCell>
                      <TableCell>Điểm TB</TableCell>
                    </>
                  )}
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={student.avatarUrl} sx={{ mr: 2 }} />
                        {tabValue === 0
                          ? student.userStudent?.fullName
                          : student.userStudentAcademic?.fullName}
                      </Box>
                    </TableCell>
                    {tabValue === 1 && (
                      <TableCell>
                        {student.userStudentAcademic?.studentCode}
                      </TableCell>
                    )}
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone ? student.phone : "-"}</TableCell>
                    {tabValue === 0 ? (
                      <>
                        <TableCell>
                          <Chip
                            label={`${
                              student.enrollments?.length || 0
                            } khóa học`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(student.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </TableCell>
                        <TableCell>{calculateStudentGrade(student)}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          {
                            student.userStudentAcademic?.academicClass
                              ?.classCode
                          }
                        </TableCell>
                        <TableCell>{calculateStudentGrade(student)}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Chip
                        label={
                          student.status === "active" ? "Hoạt động" : "Khóa"
                        }
                        color={
                          student.status === "active" ? "success" : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, student.id)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={tabValue === 0 ? 8 : 10} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Phân trang */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Menu thao tác */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Xem chi tiết" />
        </MenuItem>
        <MenuItem onClick={handleBlockClick}>
          <ListItemIcon>
            {getSelectedStudent()?.status === "active" ? (
              <Block fontSize="small" color="error" />
            ) : (
              <CheckCircle fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              getSelectedStudent()?.status === "active"
                ? "Khóa tài khoản"
                : "Mở khóa tài khoản"
            }
          />
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Xóa" />
        </MenuItem>
      </Menu>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa{" "}
            {tabValue === 0 ? "học viên" : "sinh viên"} này? Hành động này không
            thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận khóa/mở khóa */}
      <Dialog open={openBlockDialog} onClose={() => setOpenBlockDialog(false)}>
        <DialogTitle>
          {getSelectedStudent()?.status === "active"
            ? "Xác nhận khóa tài khoản"
            : "Xác nhận mở khóa tài khoản"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getSelectedStudent()?.status === "active"
              ? "Khi khóa tài khoản, người dùng sẽ không thể đăng nhập vào hệ thống. Bạn có chắc chắn muốn khóa tài khoản này không?"
              : "Khi mở khóa tài khoản, người dùng sẽ có thể đăng nhập vào hệ thống. Bạn có chắc chắn muốn mở khóa tài khoản này không?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBlockDialog(false)}>Hủy</Button>
          <Button
            onClick={handleBlockConfirm}
            color={
              getSelectedStudent()?.status === "active" ? "error" : "success"
            }
            autoFocus
          >
            {getSelectedStudent()?.status === "active" ? "Khóa" : "Mở khóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tạo bài tập cho sinh viên */}
      {openAssignmentDialog && (
        <Dialog
          open={openAssignmentDialog}
          onClose={() => setOpenAssignmentDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Tạo bài tập cho sinh viên</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              Bài tập sẽ được gán cho sinh viên thuộc:
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Lớp:</strong>{" "}
                {classFilter !== "all" ? classFilter : "Tất cả các lớp"}
              </Typography>
              <Typography variant="body2">
                <strong>Số sinh viên:</strong> {filteredStudents.length}
              </Typography>
            </Box>

            {/* Form tạo bài tập */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField label="Tiêu đề bài tập" fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Mô tả bài tập" fullWidth multiline rows={4} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hạn nộp"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Điểm tối đa"
                  type="number"
                  fullWidth
                  defaultValue={100}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAssignmentDialog(false)}>Hủy</Button>
            <Button variant="contained" color="primary">
              Tạo bài tập
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog xem chi tiết */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thông tin chi tiết</DialogTitle>
        <DialogContent>
          {getSelectedStudent() && (
            <Box>
              {/* Thông tin cơ bản */}
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ và tên
                  </Typography>
                  <Typography variant="body1">
                    {tabValue === 0
                      ? getSelectedStudent()?.userStudent?.fullName
                      : getSelectedStudent()?.userStudentAcademic?.fullName}
                  </Typography>
                </Grid>
                {tabValue === 1 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mã sinh viên
                    </Typography>
                    <Typography variant="body1">
                      {getSelectedStudent()?.userStudentAcademic?.studentCode}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {getSelectedStudent()?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1">
                    {getSelectedStudent()?.phone}
                  </Typography>
                </Grid>
                {tabValue === 0 && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Ngày sinh
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(
                          getSelectedStudent()?.userStudent?.dateOfBirth
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Giới tính
                      </Typography>
                      <Typography variant="body1">
                        {getSelectedStudent()?.userStudent?.gender === "male"
                          ? "Nam"
                          : "Nữ"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Trình độ học vấn
                      </Typography>
                      <Typography variant="body1">
                        {getSelectedStudent()?.userStudent?.educationLevel}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nghề nghiệp
                      </Typography>
                      <Typography variant="body1">
                        {getSelectedStudent()?.userStudent?.occupation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1">
                        {getSelectedStudent()?.userStudent?.address},{" "}
                        {getSelectedStudent()?.userStudent?.city},{" "}
                        {getSelectedStudent()?.userStudent?.country}
                      </Typography>
                    </Grid>
                  </>
                )}
                {tabValue === 1 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lớp
                    </Typography>
                    <Typography variant="body1">
                      {
                        getSelectedStudent()?.userStudentAcademic?.academicClass
                          ?.classCode
                      }
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={
                      getSelectedStudent()?.status === "active"
                        ? "Hoạt động"
                        : "Khóa"
                    }
                    color={
                      getSelectedStudent()?.status === "active"
                        ? "success"
                        : "error"
                    }
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Thông tin khóa học */}
              {tabValue === 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Khóa học đã đăng ký
                  </Typography>
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Tên khóa học</TableCell>
                          <TableCell>Danh mục</TableCell>
                          <TableCell>Trình độ</TableCell>
                          <TableCell>Ngày đăng ký</TableCell>
                          <TableCell>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getSelectedStudent()?.enrollments?.map(
                          (enrollment) => (
                            <TableRow key={enrollment.id}>
                              <TableCell>{enrollment.course.title}</TableCell>
                              <TableCell>
                                {enrollment.course.category.name}
                              </TableCell>
                              <TableCell>
                                {enrollment.course.level === "beginner"
                                  ? "Cơ bản"
                                  : enrollment.course.level === "intermediate"
                                  ? "Trung cấp"
                                  : "Nâng cao"}
                              </TableCell>
                              <TableCell>
                                {formatDate(enrollment.enrollmentDate)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    enrollment.status === "active"
                                      ? "Đang học"
                                      : "Đã hoàn thành"
                                  }
                                  color={
                                    enrollment.status === "active"
                                      ? "primary"
                                      : "success"
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {/* Thông tin điểm */}
              <Typography variant="h6" gutterBottom>
                Thông tin điểm
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Loại</TableCell>
                      <TableCell>Tên bài</TableCell>
                      <TableCell align="center">Điểm</TableCell>
                      <TableCell align="center">Trọng số</TableCell>
                      <TableCell>Nhận xét</TableCell>
                      <TableCell align="center">Ngày chấm</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getSelectedStudent()?.userGrades &&
                    getSelectedStudent()?.userGrades.length > 0 ? (
                      getSelectedStudent()?.userGrades.map(
                        (grade: UserGrade) => (
                          <TableRow key={grade.id}>
                            <TableCell>
                              <Chip
                                label={
                                  grade.gradeType === "assignment"
                                    ? "Bài tập"
                                    : grade.gradeType === "midterm"
                                    ? "Giữa kỳ"
                                    : grade.gradeType === "final"
                                    ? "Cuối kỳ"
                                    : grade.gradeType === "participation"
                                    ? "Tham gia"
                                    : "Bài trắc nghiệm"
                                }
                                color={
                                  grade.gradeType === "assignment"
                                    ? "primary"
                                    : grade.gradeType === "midterm"
                                    ? "secondary"
                                    : grade.gradeType === "final"
                                    ? "error"
                                    : grade.gradeType === "participation"
                                    ? "info"
                                    : "warning"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {grade.assignmentSubmission?.assignment
                                  ?.title ||
                                  grade.quizAttempt?.quiz?.title ||
                                  (grade.gradeType === "midterm"
                                    ? "Bài thi giữa kỳ"
                                    : grade.gradeType === "final"
                                    ? "Bài thi cuối kỳ"
                                    : grade.gradeType === "participation"
                                    ? "Điểm tham gia"
                                    : "Bài trắc nghiệm")}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="medium">
                                {grade.score}/{grade.maxScore}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                (
                                {(
                                  (parseFloat(grade.score) /
                                    parseFloat(grade.maxScore)) *
                                  10
                                ).toFixed(1)}
                                /10)
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${(
                                  parseFloat(grade.weight) * 100
                                ).toFixed(0)}%`}
                                color="info"
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color={
                                  grade.feedback
                                    ? "text.primary"
                                    : "text.secondary"
                                }
                              >
                                {grade.feedback || "Không có nhận xét"}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                {formatDate(grade.gradedAt)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Chưa có điểm
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Tổng kết điểm */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Điểm tổng kết:{" "}
                  {calculateStudentGrade(getSelectedStudent() as ExtendedUser)}
                </Typography>
              </Box>

              {/* Thông tin đăng nhập */}
              <Typography variant="h6" gutterBottom>
                Thông tin đăng nhập
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày tạo tài khoản
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(getSelectedStudent()?.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lần đăng nhập cuối
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(getSelectedStudent()?.lastLogin) ||
                      "Chưa đăng nhập"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminStudents;
